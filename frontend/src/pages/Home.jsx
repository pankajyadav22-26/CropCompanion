import { Link } from "react-router-dom";
import { Leaf, CalendarCheck, BarChart3, Smile } from "lucide-react";

export default function Home() {
  return (
    <div className="mt-15">
      {/* Hero Section */}
      <section className="py-20 px-10 bg-white/70 backdrop-blur-sm rounded-xl max-w-7xl mx-auto shadow-lg">
        <div className="flex flex-col-reverse md:flex-row items-center gap-10">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-green-900 leading-snug mb-6 drop-shadow-sm">
              Empower Your Farming <br />
              with Smart Planning
            </h1>
            <p className="text-green-700 mb-6 text-lg">
              Crop Companion helps you plan better, grow smarter, and achieve
              higher yields with AI-driven tools.
            </p>
            <Link
              to="/register"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-full text-lg hover:bg-green-700 shadow-md transition"
            >
              Get Started
            </Link>
          </div>
          <div className="md:w-1/2">
            <img
              src="src/assets/herofarm.jpg"
              alt="Farming illustration"
              className="w-full rounded-xl shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-green-900">
            Why Choose Crop Companion?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf className="text-green-600 mb-4" size={32} />,
                title: "Eco-Friendly Insights",
                desc: "Plan your crops sustainably with real-time data tailored to your region and soil.",
              },
              {
                icon: (
                  <CalendarCheck className="text-green-600 mb-4" size={32} />
                ),
                title: "Smart Crop Planning",
                desc: "Use AI to schedule and plan your cropping cycles for maximum yield and minimum waste.",
              },
              {
                icon: <BarChart3 className="text-green-600 mb-4" size={32} />,
                title: "Performance Dashboard",
                desc: "Track your progress with a powerful, intuitive dashboard built for farmers.",
              },
            ].map(({ icon, title, desc }, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-200"
              >
                {icon}
                <h3 className="font-semibold text-xl mb-2 text-green-800">
                  {title}
                </h3>
                <p className="text-green-700 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 px-6 bg-white/80 backdrop-blur rounded-xl shadow-inner max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-green-900">
            What Farmers Say
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              quote:
                "“Since using Crop Companion, I’ve seen a 30% increase in yield. The crop planning tool is amazing!”",
              name: "– Ramesh, Maharashtra",
            },
            {
              quote:
                "“User-friendly, accurate predictions, and helps me stay ahead of weather and pests. Highly recommend.”",
              name: "– Aarti, Punjab",
            },
          ].map(({ quote, name }, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl shadow-lg border border-green-100"
            >
              <p className="text-green-700 italic mb-4">{quote}</p>
              <div className="font-semibold text-green-800">{name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-20 px-6 text-center mt-12 rounded-t-3xl shadow-lg">
        <h2 className="text-4xl font-bold mb-4">Start Smart Farming Today</h2>
        <p className="mb-6 text-lg max-w-2xl mx-auto">
          Join thousands of farmers already planning smarter with Crop
          Companion.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-green-700 px-6 py-3 rounded-full font-medium hover:bg-green-100 transition"
        >
          Create Your Free Account
        </Link>
      </section>
    </div>
  );
}
