import { useState } from "react";
import { faqs } from "@/mocks/faqs";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background-50 py-16 md:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
        <div className="reveal text-center">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground-950 md:text-4xl">
            Questions we get a lot
          </h2>
          <p className="mt-3 text-sm text-foreground-600 md:text-base">
            What people ask most before they mix their first vial.
          </p>
        </div>

        <div className="reveal mt-10 space-y-3">
          {faqs.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-lg border border-background-200 bg-background-50"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-heading text-sm font-semibold text-foreground-950 md:text-base">
                    {faq.question}
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <i className={open ? "ri-subtract-line" : "ri-add-line"}></i>
                  </span>
                </button>
                {open && (
                  <div className="animate-fadeIn border-t border-background-100 px-5 py-4">
                    <p className="text-sm leading-relaxed text-foreground-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}