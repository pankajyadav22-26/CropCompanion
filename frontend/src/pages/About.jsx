import React from "react";

export default function About() {
  return (
    <div className="min-h-screen pt-10 px-4 text-green-900">
      {/* Header */}
      <section className="max-w-5xl mx-auto text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          About Crop Companion
        </h1>
        <p className="text-lg text-green-700">
          Helping farmers plan smarter, grow better, and live sustainably — one crop at a time.
        </p>
      </section>

      {/* Mission and Vision */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 mb-24">
        <div className="p-6 bg-white rounded-xl shadow-md transition hover:shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">🌱 Our Mission</h2>
          <p className="text-green-700 leading-relaxed">
            To empower farmers with modern tools and data-driven insights that optimize crop planning, improve yield, and reduce waste — all while keeping agriculture sustainable and farmer-friendly.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl shadow-md transition hover:shadow-lg">
          <h2 className="text-2xl font-semibold mb-3">🌍 Our Vision</h2>
          <p className="text-green-700 leading-relaxed">
            We envision a world where every farmer, regardless of land size, has access to smart technologies and information that lead to better decisions, healthier crops, and stronger communities.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-6xl mx-auto text-center mb-24">
        <h2 className="text-3xl font-bold mb-10">Meet the Team</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {[
            {
              name: "Full Name",
              role: "Founder & Agritech Engineer",
            },
            {
              name: "Full Name",
              role: "AI & Data Specialist",
            },
            {
              name: "Full Name",
              role: "Frontend Developer",
            },
          ].map((member, index) => (
            <div
              key={index}
              className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col items-center text-center"
            >
              <img
                src="src/assets/profile.png"
                alt={member.name}
                className="w-24 h-24 rounded-full mb-4 object-cover border"
              />
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-green-700">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 text-white py-12 px-6 rounded-xl max-w-5xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Join Us on Our Journey</h2>
        <p className="mb-5 text-base md:text-lg">
          Whether you’re a farmer, student, or enthusiast — together we can grow smarter.
        </p>
        <a
          href="/register"
          className="inline-block bg-white text-green-700 px-6 py-2 rounded-full font-semibold hover:bg-green-100 transition"
        >
          Get Started
        </a>
      </section>
    </div>
  );
}