import { motion } from 'framer-motion';
import { testimonials } from '../data/landing';
import { SectionHeading } from '../components/landing/SectionHeading';
import { TestimonialCard } from '../components/landing/TestimonialCard';

export function TestimonialsSection() {
  return (
    <section aria-label="Testimonials" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading heading={testimonials.heading} />
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.items.map((item, i) => (
            <TestimonialCard key={item.org} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
