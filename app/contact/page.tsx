"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting:", { name, message });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              How to Reach Us?
            </h1>
            <p className="text-gray-600">
              Just call us at given number or you can also visit us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg border-2 border-[#FFD700] p-6 shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 text-sm text-center">
                Hassan Center 1st Floor Gulberg 3 opposite to Hafeez Center
                Gulberg 3, Lahore, Punjab, Pakistan
              </p>
            </div>

            <div className="bg-white rounded-lg border-2 border-[#FFD700] p-6 shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 text-sm text-center font-semibold">
                0321-111-111-8
              </p>
            </div>

            <div className="bg-white rounded-lg border-2 border-[#FFD700] p-6 shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-700 text-sm text-center">
                goldennumberscontact@gmail.com
                <br />
                Or : contact@goldennumbers.pk
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.5!2d74.3315!3d31.5204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919045e3e8c0b8b%3A0x8c0b8b8b8b8b8b8b!2sHassan%20Center%2C%20Gulberg%203%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
                title="Location Map"
              ></iframe>
            </div>

            <div className="bg-white rounded-lg border-2 border-[#FFD700] p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Message Us
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    NAME
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-[#FFD700] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-gray-800"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    MESSAGE
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-[#FFD700] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-gray-800 resize-none"
                    placeholder="Enter your message"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Submit Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
