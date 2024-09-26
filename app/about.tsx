import { IconMapPin } from '@tabler/icons-react';
import { Image } from 'antd';

export default function About() {
  return (
    <>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src="/placeholder.svg?height=400&width=400&text=Manager+Photo"
                alt="Manager"
                className="rounded-full w-64 h-64 mx-auto mb-4"
              />
              <h2 className="text-2xl font-semibold text-center mb-2">Jane Doe</h2>
              <p className="text-center text-gray-600 mb-4">Founder & CEO</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Our Story</h3>
              <p className="text-gray-600 mb-4">
                Jane Doe founded CleanGreen Services with a vision to provide top-quality cleaning, gardening, and
                property management services while prioritizing environmental responsibility. With over 15 years of
                experience in the industry, Jane has built a team of dedicated professionals who share her passion for
                excellence and sustainability.
              </p>
              <p className="text-gray-600">
                Under Jane&apos;s leadership, CleanGreen Services has become a trusted partner for homeowners, property
                managers, and Airbnb hosts throughout the region. Our commitment to eco-friendly practices and
                exceptional service has earned us a reputation as the go-to choice for those who value both cleanliness
                and environmental stewardship.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Eco-Friendly Commitment</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <Image
              src="/placeholder.svg?height=150&width=150&text=Eco+Label"
              alt="Eco-Friendly Label"
              className="w-32 h-32"
            />
            <div className="max-w-2xl">
              <p className="text-gray-600 mb-4">
                At CleanGreen Services, we&apos;re proud to be certified as an eco-responsible company. Our commitment
                to sustainability goes beyond just using green cleaning products. We implement water-saving techniques,
                minimize waste, and use energy-efficient equipment in all our operations.
              </p>
              <p className="text-gray-600">
                By choosing CleanGreen Services, you&apos;re not just getting a clean space – you&apos;re contributing
                to a healthier planet. We believe that every small action counts, and we&apos;re dedicated to making a
                positive impact on the environment with every service we provide.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Location</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-full md:w-1/2 h-64 bg-gray-300 rounded-lg overflow-hidden">
              {/* Replace this with an actual map component or embed */}
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <IconMapPin className="text-gray-400" size={48} />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-semibold mb-2">CleanGreen Services Headquarters</h3>
              <p className="text-gray-600 mb-2">123 Green Street</p>
              <p className="text-gray-600 mb-2">Eco City, EC 12345</p>
              <p className="text-gray-600">United States</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
