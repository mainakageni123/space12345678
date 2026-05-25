import React from 'react';
import Container from './Container';
import Navbar from './Navbar';
import Card from './Card';
import { Input, Button } from './FormComponents';

const ExamplePage = () => {
  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Contact', href: '/contact' },
  ];
  
  return (
    <div className="responsive-base">
      <Navbar 
        logo="/logo.png"
        logoAlt="Company Logo"
        menuItems={menuItems}
      />
      
      <main className="min-h-screen bg-gray-50 py-8">
        <Container>
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="fluid-heading-1 font-bold text-gray-900 mb-4">
              Welcome to Our Responsive Site
            </h1>
            <p className="fluid-text-base text-gray-600 max-w-2xl mx-auto">
              This page demonstrates the responsive components working across all device sizes.
            </p>
          </section>
          
          {/* Cards Grid */}
          <section className="mb-12">
            <h2 className="fluid-heading-2 font-semibold mb-6">Our Features</h2>
            <div className="responsive-grid responsive-grid-cols-1 md:responsive-grid-cols-2 lg:responsive-grid-cols-3 gap-6">
              <Card
                imageSrc="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
                title="Mobile First"
                aspectRatio="16-9"
              >
                Designed with mobile devices in mind, then enhanced for larger screens.
              </Card>
              
              <Card
                imageSrc="https://images.unsplash.com/photo-1558618666-fcd25c85cd64"
                title="Touch Friendly"
                aspectRatio="16-9"
              >
                All interactive elements are sized for easy touch interaction.
              </Card>
              
              <Card
                imageSrc="https://images.unsplash.com/photo-1555949963-aa79dcee981c"
                title="Fluid Typography"
                aspectRatio="16-9"
              >
                Text scales smoothly between device sizes for optimal readability.
              </Card>
            </div>
          </section>
          
          {/* Form Section */}
          <section className="max-w-lg mx-auto">
            <h2 className="fluid-heading-2 font-semibold mb-6">Contact Us</h2>
            <form className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
              <Input
                label="Name"
                type="text"
                placeholder="Enter your name"
                required
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                required
              />
              
              <Button type="submit" className="w-full">
                Submit Message
              </Button>
            </form>
          </section>
        </Container>
      </main>
      
      <footer className="bg-gray-800 text-white py-8">
        <Container>
          <div className="responsive-flex responsive-flex-col md:responsive-flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-300">© 2024 Your Company. All rights reserved.</p>
            </div>
            <div className="responsive-flex gap-4">
              <a href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-300 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default ExamplePage;
