'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What is FlushPin?',
    answer:
      'An app people use to find restrooms and door codes nearby. Thousands already use it across California. Your business page on FlushPin is where they see your info — and your offer.',
  },
  {
    question: 'Do my customers need to download an app?',
    answer:
      'No. The QR sticker works with any phone camera. They scan, see your offer, get the code. Ten seconds.',
  },
  {
    question: 'I already tell everyone the code. Why do I need this?',
    answer:
      'Right now that moment is wasted. Your staff loses time, and the customer walks past your menu without looking. With FlushPin, that same moment shows them your offer instead — and your staff never has to stop working.',
  },
  {
    question: 'Do I need any equipment?',
    answer: 'No. Just a sticker. We send it to you, or you print it yourself.',
  },
  {
    question: 'What if I change my restroom code?',
    answer: 'Update it in one tap from your phone. The QR stays the same.',
  },
  {
    question: 'What do my customers see first?',
    answer: 'Your offer, your words. Then the code. Nothing else.',
  },
  {
    question: 'Can I turn it off?',
    answer: 'Yes, anytime. No contract, no cancellation fee.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'Free Listing is $0. Starter QR is $9/mo per location. Business is $29/mo per location. Multi-Location is $49/mo for up to 10 locations. Growth / Local Ads is a future custom package. There is no long contract, and shops can start small.',
  },
]

export default function BusinessFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-fp-white px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-fp-ink md:text-3xl">
          Questions owners ask
        </h2>
        <div className="mt-10 divide-y divide-fp-border border-y border-fp-border">
          {faqs.map(({ question, answer }, index) => {
            const isOpen = openIndex === index
            return (
              <div key={question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-semibold text-fp-ink">{question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-fp-gray-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <p className="pb-5 text-base leading-relaxed text-fp-gray-600">{answer}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
