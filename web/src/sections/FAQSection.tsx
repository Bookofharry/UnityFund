import { motion } from 'framer-motion';
import { faq } from '../data/landing';
import { SectionHeading } from '../components/landing/SectionHeading';
import { FAQItem } from '../components/landing/FAQItem';

export function FAQSection() {
  return (
    <section id="faq" aria-label="Frequently asked questions" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading heading={faq.heading} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white px-6 shadow-card"
        >
          {faq.items.map((item, i) => (
            <FAQItem key={item.q} question={item.q} answer={item.a} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
