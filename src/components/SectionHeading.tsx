type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
  centered?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[#ec7047]">
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-[2rem] font-semibold leading-[1.13] tracking-[-0.055em] sm:text-[2.65rem] ${
          light ? "text-white" : "text-[#17271f]"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 max-w-xl text-sm leading-6 sm:text-[15px] sm:leading-7 ${
            light ? "text-white/65" : "text-[#77827a]"
          } ${centered ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
