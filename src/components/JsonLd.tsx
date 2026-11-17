// One <script type="application/ld+json"> per schema object.
//
// Never emit a root-level JSON array: some consumers (notably the Meta pixel's
// JSON-LD reader) assume each block's root is an object and read "@context"
// off it, which throws `undefined is not an object (evaluating
// 'r["@context"].toLowerCase')` in Safari. Multiple blocks are fine for
// Google and every other structured-data consumer.
export function JsonLd({ data }: { data: object | object[] }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean);
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            // "<" escaped so a value can never close the script tag early.
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
