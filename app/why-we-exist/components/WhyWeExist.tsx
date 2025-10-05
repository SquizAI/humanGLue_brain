'use client'

export function WhyWeExist() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-gendy">
          Why We Exist
        </h1>
        <p className="text-xl text-gray-300 mb-8 font-diatype">
          The Biggest Risk Isn't AI, It's People Left Behind
        </p>
        <div className="prose prose-invert max-w-none font-diatype">
          <p className="text-lg text-gray-400 leading-relaxed">
            Work is evolving faster than humans can keep up. Change management is broken.
            Employees are unsure if they fit in an AI-driven future. HumanGlue solves the
            real problem: helping people adapt, or companies fall behind.
          </p>
        </div>
      </div>
    </div>
  )
}
