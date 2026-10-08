'use client';

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { twMerge } from 'tailwind-merge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NamePath = string | number | readonly (string | number)[];

export interface Rule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message?: string;
  validator?: (rule: Rule, value: unknown) => Promise<void>;
}

/** A rule can be a plain object or a function receiving getFieldValue (antd-style) */
export type RuleOrFn = Rule | ((getFieldValue: (name: NamePath) => unknown) => Rule);

export interface FieldError {
  name: NamePath;
  errors: string[];
}

interface FieldMeta {
  rules: RuleOrFn[];
}

interface FormStore {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  submitted: boolean;
}

interface InternalApi {
  store: FormStore;
  registry: Map<string, FieldMeta>;
  validateAll: () => Promise<{ values: Record<string, unknown>; errorFields: FieldError[] }>;
  markTouched: (name: NamePath) => void;
  clearErrorsUnder: (name: NamePath) => void;
}

export interface FormInstance<T = Record<string, unknown>> {
  values: T;
  getFieldValue: (name: NamePath) => unknown;
  getFieldsValue: () => T;
  getFieldError: (name: NamePath) => string[];
  setFieldValue: (name: NamePath, value: unknown) => void;
  setFields: (fields: { name: NamePath; value: unknown; touched?: boolean }[]) => void;
  resetFields: (names?: NamePath[]) => void;
  isFieldTouched: (name: NamePath) => boolean;
  __internal: InternalApi;
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

const toPath = (name: NamePath): (string | number)[] => (Array.isArray(name) ? [...name] : [name as string | number]);

const pathKey = (name: NamePath): string => toPath(name).join('.');

function getIn(obj: unknown, path: (string | number)[]): unknown {
  let cur = obj as Record<string | number, unknown> | null | undefined;
  for (const key of path) {
    if (cur == null) return undefined;
    cur = cur[key] as Record<string | number, unknown>;
  }
  return cur;
}

function setIn<T>(obj: T, path: (string | number)[], value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const source = (obj ?? {}) as Record<string | number, unknown> | unknown[];
  const clone = (Array.isArray(source) ? [...source] : { ...source }) as Record<string | number, unknown>;
  clone[head] = setIn((source as Record<string | number, unknown>)[head], rest, value);
  return clone as T;
}

// ---------------------------------------------------------------------------
// useForm
// ---------------------------------------------------------------------------

export function useForm<T extends Record<string, unknown> = Record<string, unknown>>(
  initialValues: T,
): [FormInstance<T>] {
  const [store, setStore] = useState<FormStore>({
    values: initialValues as Record<string, unknown>,
    errors: {},
    touched: {},
    submitted: false,
  });
  const initialRef = useRef(initialValues);
  const registry = useRef(new Map<string, FieldMeta>()).current;

  const runRules = useCallback(
    async (key: string, rules: RuleOrFn[], values: Record<string, unknown>): Promise<string[]> => {
      const value = getIn(values, key.split('.'));
      const getter = (name: NamePath) => getIn(values, toPath(name));
      const errs: string[] = [];
      for (const ruleOrFn of rules) {
        const rule = typeof ruleOrFn === 'function' ? ruleOrFn(getter) : ruleOrFn;
        const str = value == null ? '' : String(value);
        if (rule.required && (value == null || str === '' || (Array.isArray(value) && value.length === 0))) {
          errs.push(rule.message ?? 'Required');
          continue;
        }
        // Non-required empty values skip the remaining checks
        if (value == null || str === '') continue;
        if (rule.min != null && str.length < rule.min) {
          errs.push(rule.message ?? `Min ${rule.min}`);
          continue;
        }
        if (rule.max != null && str.length > rule.max) {
          errs.push(rule.message ?? `Max ${rule.max}`);
          continue;
        }
        if (rule.pattern && !rule.pattern.test(str)) {
          errs.push(rule.message ?? 'Invalid');
          continue;
        }
        if (rule.validator) {
          try {
            await rule.validator(rule, value);
          } catch (e) {
            errs.push(e instanceof Error ? e.message : String(e));
          }
        }
      }
      return errs;
    },
    [],
  );

  const getFieldValue = useCallback((name: NamePath) => getIn(store.values, toPath(name)), [store.values]);

  const getFieldError = useCallback(
    (name: NamePath): string[] => {
      const key = pathKey(name);
      const out: string[] = [];
      for (const [k, errs] of Object.entries(store.errors)) {
        if (k === key || k.startsWith(key + '.')) out.push(...errs);
      }
      return out;
    },
    [store.errors],
  );

  const setFieldValue = useCallback(
    (name: NamePath, value: unknown) => {
      const key = pathKey(name);
      setStore(s => {
        const values = setIn(s.values, toPath(name), value);
        const meta = registry.get(key);
        if (meta) {
          // Re-validate the field against the new values (validateTrigger: onChange)
          void runRules(key, meta.rules, values).then(errors =>
            setStore(s2 => ({ ...s2, errors: { ...s2.errors, [key]: errors } })),
          );
        }
        return { ...s, values, touched: { ...s.touched, [key]: true } };
      });
    },
    [registry, runRules],
  );

  const setFields = useCallback((fields: { name: NamePath; value: unknown; touched?: boolean }[]) => {
    setStore(s => {
      let values = s.values;
      const touched = { ...s.touched };
      for (const f of fields) {
        values = setIn(values, toPath(f.name), f.value);
        touched[pathKey(f.name)] = f.touched ?? true;
      }
      return { ...s, values, touched };
    });
  }, []);

  const resetFields = useCallback(
    (names?: NamePath[]) => {
      setStore(s => {
        const targetKeys = names ? names.map(pathKey) : [...registry.keys()];
        let values = s.values;
        const touched = { ...s.touched };
        const errors = { ...s.errors };
        for (const key of targetKeys) {
          values = setIn(values, key.split('.'), getIn(initialRef.current, key.split('.')));
          for (const k of Object.keys(touched)) {
            if (k === key || k.startsWith(key + '.')) delete touched[k];
          }
          for (const k of Object.keys(errors)) {
            if (k === key || k.startsWith(key + '.')) delete errors[k];
          }
        }
        return { ...s, values, touched, errors, submitted: false };
      });
    },
    [registry],
  );

  const isFieldTouched = useCallback((name: NamePath) => !!store.touched[pathKey(name)], [store.touched]);

  const validateAll = useCallback(async () => {
    const vals = store.values;
    const newErrors: Record<string, string[]> = {};
    const touchedAll = { ...store.touched };
    for (const [key, meta] of registry) {
      newErrors[key] = await runRules(key, meta.rules, vals);
      touchedAll[key] = true;
    }
    setStore(s => ({ ...s, errors: newErrors, touched: touchedAll, submitted: true }));
    const errorFields: FieldError[] = Object.entries(newErrors)
      .filter(([, errs]) => errs.length > 0)
      .map(([k, errors]) => ({ name: k, errors }));
    return { values: vals, errorFields };
  }, [registry, runRules, store.values, store.touched]);

  const markTouched = useCallback((name: NamePath) => {
    const key = pathKey(name);
    setStore(s => (s.touched[key] ? s : { ...s, touched: { ...s.touched, [key]: true } }));
  }, []);

  const clearErrorsUnder = useCallback((name: NamePath) => {
    const key = pathKey(name);
    setStore(s => {
      const errors = { ...s.errors };
      for (const k of Object.keys(errors)) {
        if (k === key || k.startsWith(key + '.')) delete errors[k];
      }
      return { ...s, errors };
    });
  }, []);

  const internal = useMemo<InternalApi>(
    () => ({ store, registry, validateAll, markTouched, clearErrorsUnder }),
    [store, registry, validateAll, markTouched, clearErrorsUnder],
  );

  const instance = useMemo<FormInstance<T>>(
    () => ({
      values: store.values as T,
      getFieldValue,
      getFieldsValue: () => store.values as T,
      getFieldError,
      setFieldValue,
      setFields,
      resetFields,
      isFieldTouched,
      __internal: internal,
    }),
    [store.values, getFieldValue, getFieldError, setFieldValue, setFields, resetFields, isFieldTouched, internal],
  );

  return [instance];
}

// ---------------------------------------------------------------------------
// Context & Form
// ---------------------------------------------------------------------------

interface FormContextValue {
  form: FormInstance;
  disabled: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

/** Path prefix injected by FieldList so nested Fields resolve as `List.i.prop` */
const PathPrefixContext = createContext<(string | number)[]>([]);

export function Form<T extends Record<string, unknown>>({
  form,
  onFinish,
  onFinishFailed,
  disabled,
  children,
  className,
}: {
  form: FormInstance<T>;
  onFinish?: (values: T) => void | Promise<void>;
  onFinishFailed?: (errorInfo: { errorFields: FieldError[] }) => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { values, errorFields } = await form.__internal.validateAll();
    if (errorFields.length > 0) {
      onFinishFailed?.({ errorFields });
      // Scroll to the first invalid field (scrollToFirstError equivalent)
      document
        .querySelector(`[data-field="${pathKey(errorFields[0].name)}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      await onFinish?.(values as T);
    }
  };

  return (
    <FormContext.Provider value={{ form: form as FormInstance, disabled: !!disabled }}>
      <form className={className} onSubmit={handleSubmit} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Field
// ---------------------------------------------------------------------------

export interface FieldProps {
  name?: NamePath;
  label?: ReactNode;
  rules?: RuleOrFn[];
  hasFeedback?: boolean;
  noStyle?: boolean;
  children: ReactElement;
  className?: string;
}

export function Field({ name, label, rules = [], hasFeedback, noStyle, children, className }: FieldProps) {
  const ctx = useContext(FormContext);
  const prefix = useContext(PathPrefixContext);
  const key = name != null ? pathKey([...prefix, ...toPath(name)]) : undefined;
  const metaRef = useRef<FieldMeta>({ rules: [] });
  metaRef.current.rules = rules;

  const form = ctx?.form;
  useEffect(() => {
    if (form && key) {
      form.__internal.registry.set(key, metaRef.current);
      return () => {
        form.__internal.registry.delete(key);
      };
    }
    return undefined;
  }, [form, key]);

  if (!ctx || !form || key == null) {
    return noStyle ? children : <div className={className}>{children}</div>;
  }

  const { store } = form.__internal;
  const value = getIn(store.values, key.split('.'));
  const errors = store.errors[key] ?? [];
  const showError = errors.length > 0 && (store.touched[key] || store.submitted);
  const isValid = hasFeedback && (store.touched[key] || store.submitted) && !showError && String(value ?? '') !== '';

  const child = Children.only(children);
  const control = isValidElement(child)
    ? cloneElement(child as ReactElement<Record<string, unknown>>, {
        value: value ?? '',
        onChange: (e: unknown) => {
          const v =
            e && typeof e === 'object' && 'target' in (e as object)
              ? (e as React.ChangeEvent<HTMLInputElement>).target.value
              : e;
          form.setFieldValue(key, v);
        },
        onBlur: () => form.__internal.markTouched(key),
        status: showError ? ('error' as const) : undefined,
        disabled: ctx.disabled,
        'data-field': key,
        id: key,
      })
    : child;

  if (noStyle) return control;

  return (
    <div className={twMerge('mb-5', className)}>
      {label && (
        <label htmlFor={key} className="mb-1.5 block text-sm font-medium text-bark dark:text-cream">
          {label}
        </label>
      )}
      <div className="relative">
        {control}
        {hasFeedback && (showError || isValid) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {showError ? (
              <IconX size={16} className="text-red-500" />
            ) : (
              <IconCheck size={16} className="text-green-500" />
            )}
          </span>
        )}
      </div>
      {showError && <p className="mt-1.5 text-sm text-red-500">{errors[0]}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FieldList — dynamic array fields (antd Form.List equivalent)
// ---------------------------------------------------------------------------

export interface FieldListItem {
  key: number;
  name: number;
}

export function FieldList({
  name,
  children,
}: {
  name: NamePath;
  children: (fields: FieldListItem[], ops: { add: () => void; remove: (index: number) => void }) => ReactNode;
}) {
  const ctx = useContext(FormContext);
  const keysRef = useRef<number[]>([]);
  const nextKeyRef = useRef(0);

  if (!ctx) return null;
  const { form } = ctx;
  const list = (form.getFieldValue(name) as unknown[] | undefined) ?? [];

  // Keep stable keys aligned with the current list length
  while (keysRef.current.length < list.length) keysRef.current.push(nextKeyRef.current++);

  const fields: FieldListItem[] = list.map((_, i) => ({ key: keysRef.current[i], name: i }));

  const add = () => {
    keysRef.current.splice(list.length, 0, nextKeyRef.current++);
    form.setFieldValue(name, [...list, {}]);
  };

  const remove = (index: number) => {
    keysRef.current.splice(index, 1);
    form.setFieldValue(
      name,
      list.filter((_, i) => i !== index),
    );
    // Indexes shift after removal — drop stale errors under the list path
    form.__internal.clearErrorsUnder(name);
  };

  return (
    <PathPrefixContext.Provider value={toPath(name)}>{children(fields, { add, remove })}</PathPrefixContext.Provider>
  );
}
