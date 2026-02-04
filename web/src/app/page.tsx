import Link from "next/link";
import { ClipboardList, BarChart3, Building2, TrendingUp, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
              <ClipboardList className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl">B2B Survey</span>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/login" className="btn btn-outline border-white/30 text-white hover:bg-white hover:text-[var(--primary)]">
              Admin Login
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Help Shape the Future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-200">
              B2B Procurement
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Share your business procurement needs and requirements.
            Your insights will help us build a better marketplace for all businesses.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/survey" className="btn btn-accent text-lg px-8 py-4 shadow-lg">
              Start Survey
              <span className="ml-2">→</span>
            </Link>
            <a href="#features" className="btn bg-white/10 backdrop-blur text-white hover:bg-white/20 text-lg px-8 py-4">
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Industries Covered", value: "17+" },
              { label: "Questions Tailored", value: "100+" },
              { label: "Minutes to Complete", value: "5-10" },
              { label: "Data Security", value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="glass-dark rounded-2xl p-6">
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">
              Why Participate?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              Your input directly influences how we build solutions for businesses like yours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Better Pricing",
                description: "Help us understand market rates to negotiate better deals for you."
              },
              {
                icon: Users,
                title: "Tailored Solutions",
                description: "Get solutions specifically designed for your industry's needs."
              },
              {
                icon: Shield,
                title: "Data Privacy",
                description: "Your data is secure and used only for improving our services."
              },
            ].map((feature) => (
              <div key={feature.title} className="card p-8 text-center">
                <div className="w-16 h-16 gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Preview */}
      <section className="py-24 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">
              Industries We Cover
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Tailored surveys for every business type
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: "🏨", name: "Hotels" },
              { icon: "🍽️", name: "Restaurants" },
              { icon: "🏥", name: "Hospitals" },
              { icon: "🩺", name: "Clinics" },
              { icon: "🏫", name: "Schools" },
              { icon: "🎓", name: "Colleges" },
              { icon: "💒", name: "Wedding Planners" },
              { icon: "🎪", name: "Events" },
              { icon: "🔧", name: "Workshops" },
              { icon: "💇", name: "Salons" },
              { icon: "🏋️", name: "Gyms" },
              { icon: "🏢", name: "Offices" },
            ].map((industry) => (
              <div
                key={industry.name}
                className="bg-[var(--background)] rounded-xl p-4 text-center hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className="text-3xl mb-2">{industry.icon}</div>
                <div className="text-sm font-medium text-[var(--text-secondary)]">{industry.name}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/survey" className="btn btn-primary text-lg px-8">
              Start Your Survey Now
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-primary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Share Your Requirements?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Takes only 5-10 minutes. Your input is invaluable.
          </p>
          <Link href="/survey" className="btn btn-accent text-lg px-10 py-4 shadow-xl">
            Take the Survey
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--primary-dark)] text-white/60 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">B2B Survey Platform</span>
          </div>
          <p className="text-sm">
            © 2024 B2B Survey Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
