import { motion } from 'framer-motion';
import { features } from '../data/landing';
import { SectionHeading } from '../components/landing/SectionHeading';
import { FeatureCard } from '../components/landing/FeatureCard';

export function FeaturesSection() {
  return (
    <section id="features" aria-label="Features" className="bg-[#f5f7ff] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading heading={features.heading} subheading={features.subheading} />
        </motion.div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.items.map((item, i) => (
            <FeatureCard key={item.title} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
