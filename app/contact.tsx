'use client';

import { IconMail, IconMapPin, IconPhone } from '@tabler/icons-react';
import { Button, Input } from 'antd';

const { TextArea } = Input;

export default function Contact() {
  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input type="text" id="name" name="name" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input type="email" id="email" name="email" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input type="tel" id="phone" name="phone" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <TextArea id="message" name="message" rows={4} required showCount maxLength={100} />
                </div>
                <Button htmlType="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <IconMapPin className="mr-2 mt-1" size={18} />
                  <div>
                    <p className="font-semibold">Address:</p>
                    <p>123 Green Street</p>
                    <p>Eco City, EC 12345</p>
                    <p>United States</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <IconPhone className="mr-2" size={18} />
                  <div>
                    <p className="font-semibold">Phone:</p>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <IconMail className="mr-2" size={18} />
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>info@cleangreenservices.com</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
