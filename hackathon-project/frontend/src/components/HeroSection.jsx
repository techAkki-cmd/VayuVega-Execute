export default function HeroSection() {
  return (
    <div className="mx-8 my-8 lg:mx-12">
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-16 sm:py-24 lg:py-32 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
                Unlock actionable insights from customer feedback
              </h1>
              <p className="mt-8 text-lg font-medium text-pretty text-gray-200 sm:text-xl/8">
                Analyze sentiment, categorize features, and stay ahead of the competition
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-[#b80c09] px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#b82309] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </a>
                <a href="#" className="text-sm/6 font-semibold text-white hover:text-gray-300">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
