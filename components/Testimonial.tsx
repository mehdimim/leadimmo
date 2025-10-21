type TestimonialItem = {
  quote: string;
  author: string;
};

type TestimonialProps = {
  items: TestimonialItem[];
};

export default function Testimonial({ items }: TestimonialProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <figure key={item.author} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <blockquote className="text-base text-slate-700">â€œ{item.quote}â€</blockquote>
          <figcaption className="mt-4 text-sm font-semibold text-slate-900">{item.author}</figcaption>
        </figure>
      ))}
    </div>
  );
}
