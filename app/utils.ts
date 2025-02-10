export const getPhoneNumber = (phone: string) => {
  return phone.replaceAll(' ', '').replaceAll('-', '').replaceAll('(+33)0', '+33');
};
