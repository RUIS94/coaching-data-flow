interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  inlineChildren?: boolean;
  titleClassName?: string;
}

export function PageHeader({ title, subtitle, children, inlineChildren = false, titleClassName }: PageHeaderProps) {
  const titleCls = titleClassName ?? 'text-lg font-semibold text-foreground';
  return (
    <div className={`flex items-center ${inlineChildren ? 'justify-start gap-3' : 'justify-between'} py-4 px-6 min-h-[64px]`}>
      {inlineChildren ? (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <h1 className={titleCls}>{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </div>
      ) : (
        <>
          <div>
            <h1 className={titleCls}>{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children && <div className="flex items-center gap-2">{children}</div>}
        </>
      )}
    </div>
  );
}
