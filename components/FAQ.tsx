type FAQItem = {
  question: string;
  answer: string;
};

type FAQProps = {
  items: FAQItem[];
};

export default function FAQ({ items }: FAQProps) {
  return (
    <dl className="space-y-6">
      {items.map((item) => (
        <div key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <dt className="font-semibold text-slate-900">{item.question}</dt>
          <dd className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</dd>
        </div>
      ))}
    </dl>
  );
}
