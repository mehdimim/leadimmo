type TestimonialItem = {
  quote: string;
  author: string;
  role?: string;
  badge?: string;
};

type TestimonialProps = {
  items: TestimonialItem[];
};

export default function Testimonial({ items }: TestimonialProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <figure
          key={`${item.author}-${item.role ?? ''}`}
          className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <blockquote className="text-base text-slate-700">&ldquo;{item.quote}&rdquo;</blockquote>
          <figcaption className="mt-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{item.author}</span>
            {item.role ? <span className="text-slate-500"> - {item.role}</span> : null}
          </figcaption>
          {item.badge ? (
            <span className="mt-3 inline-flex w-fit items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              {item.badge}
            </span>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
