import { slugify } from "../utils";

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

function HeadingWithId({ level, children, ...props }: React.PropsWithChildren<{ level: number } & React.HTMLAttributes<HTMLHeadingElement>>) {
  const Tag = `h${level}` as React.ElementType;
  const id = slugify(extractText(children));
  return <Tag id={id} {...props}>{children}</Tag>;
}

export const headingComponents = {
  h1: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={1} {...props} />,
  h2: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={2} {...props} />,
  h3: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={3} {...props} />,
  h4: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={4} {...props} />,
  h5: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={5} {...props} />,
  h6: (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => <HeadingWithId level={6} {...props} />,
};

export default HeadingWithId;
