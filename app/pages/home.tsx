import { Button, Card, Carousel, Image } from 'antd';

const t = {
  fr: {
    Services: 'Nos Services',
    Cleaning: 'Nettoyage',
    Gardening: 'Jardinage',
    CheckInOut: 'Check-in / Check-out',
    EcoFriendly: 'Eco Responsable',
    ClothesHandling: 'Gestion du linge',
    WelcomeBasket: 'Panier de bienvenue',
    MultiService: 'Multi-Services',
    CleaningDescription: 'Services de nettoyage professionnels pour tous types de propriétés.',
    GardeningDescription: 'Expertise en jardinage et terrassement pour garder vos espaces extérieurs beaux.',
    CheckInOutDescription: 'Services de check-in et check-out pour les propriétés louées.',
    ClothesHandlingDescription: 'Nettoyage professionnel et changement du linge.',
    WelcomeBasketDescription: "Offre d'un panier de bienvenue avec une sélection de produits locaux.",
    MultiServiceDescription: 'Peinture, maçonnerie, toiture, plomberie, électricité, bricolages',
    EcoFriendlyDescription:
      'À CMD Breizh, nous sommes engagés à utiliser des produits de nettoyage écoresponsables et des pratiques durables pour minimiser notre empreinte écologique tout en livrant un service exceptionnel.',
    ReadyToExperience: 'Prêt à expérimenter notre service ?',
    ContactUs: 'Contactez-nous dès maintenant',
  },
  en: {
    Services: 'Our Services',
    Cleaning: 'Cleaning',
    Gardening: 'Gardening',
    CheckInOut: 'Check-in / Check-out',
    EcoFriendly: 'Eco-Friendly',
    ClothesHandling: 'Clothes Handling',
    WelcomeBasket: 'Welcome Basket',
    MultiService: 'Multi-Service',
    CleaningDescription: 'Professional cleaning services for all types of properties.',
    GardeningDescription: 'Expert gardening and landscaping to keep your outdoor spaces beautiful.',
    CheckInOutDescription: 'Seamless check-in and check-out services for rental properties.',
    ClothesHandlingDescription: 'Professional cleaning and clothes handling services.',
    WelcomeBasketDescription: 'A welcome basket with a selection of local products.',
    MultiServiceDescription: 'Painting, masonry, woodworking, etc',
    EcoFriendlyDescription:
      'At CMD Breizh, we&apos;re committed to using environmentally friendly cleaning products and sustainable practices to minimize our ecological footprint while delivering exceptional service.',
    ReadyToExperience: 'Ready to experience our top-notch services?',
    ContactUs: 'Contact Us Today',
  },
};

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
          <h2 className="text-3xl font-bold text-center mb-8">{t['fr'].Services}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{t['fr'].Cleaning}</h3>
                <p className="text-gray-600">{t['fr'].CleaningDescription}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{t['fr'].Gardening}</h3>
                <p className="text-gray-600">{t['fr'].GardeningDescription}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{t['fr'].CheckInOut}</h3>
                <p className="text-gray-600">{t['fr'].CheckInOutDescription}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{t['fr'].ClothesHandling}</h3>
                <p className="text-gray-600">{t['fr'].ClothesHandlingDescription}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{t['fr'].WelcomeBasket}</h3>
                <p className="text-gray-600">{t['fr'].WelcomeBasketDescription}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{t['fr'].MultiService}</h3>
                <p className="text-gray-600">{t['fr'].MultiServiceDescription}</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-green-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">{t['fr'].EcoFriendly}</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">{t['fr'].EcoFriendlyDescription}</p>
          <div className="mt-8 text-center">
            <Image
              src="/placeholder.svg?height=100&width=100&text=Eco+Label"
              alt="Eco-Friendly Label"
              className="inline-block"
            />
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t['fr'].ReadyToExperience}</h2>
          <Button href="/contact" target="_blank">
            {t['fr'].ContactUs}
          </Button>
        </div>
      </section>
    </>
  );
}
