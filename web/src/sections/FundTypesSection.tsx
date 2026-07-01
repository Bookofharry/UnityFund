import { motion } from 'framer-motion';
import { fundTypes } from '../data/landing';
import { SectionHeading } from '../components/landing/SectionHeading';
import { FundTypeCard } from '../components/landing/FundTypeCard';

export function FundTypesSection() {
  return (
    <section id="fund-types" aria-label="Fund types" className="bg-[#f5f7ff] py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionHeading heading={fundTypes.heading} subheading={fundTypes.subheading} />
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fundTypes.items.map((item, i) => (
            <FundTypeCard key={item.title} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
