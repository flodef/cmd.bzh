import { Button, Card, Carousel, Image } from 'antd';

export default function Home() {
  return (
    <>
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <Carousel className="w-full max-w-4xl mx-auto" autoplay>
            {[1, 2, 3, 4, 5].map(index => (
              <div key={index}>
                <Card>
                  <div className="flex aspect-square items-center justify-center p-6">
                    <Image
                      src={`/placeholder.svg?height=400&width=600&text=Service+Image+${index}`}
                      alt={`Service ${index}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Cleaning</h3>
                <p className="text-gray-600">Professional cleaning services for all types of properties.</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Gardening</h3>
                <p className="text-gray-600">Expert gardening and landscaping to keep your outdoor spaces beautiful.</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Check-in/out Services</h3>
                <p className="text-gray-600">Seamless check-in and check-out services for rental properties.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-green-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Eco-Friendly Practices</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            At CleanGreen Services, we&apos;re committed to using environmentally friendly cleaning products and
            sustainable practices to minimize our ecological footprint while delivering exceptional service.
          </p>
          <div className="mt-8 text-center">
            <Image
              src="/placeholder.svg?height=100&width=100&text=Eco+Label"
              alt="Eco-Friendly Label"
              className="inline-block"
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to experience our top-notch services?</h2>
          <Button href="/contact" target="_blank">
            {/* <Link  className="bg-white text-primary hover:bg-gray-100"> */}
            Contact Us Today
            {/* </Link> */}
          </Button>
        </div>
      </section>
    </>
  );
}
