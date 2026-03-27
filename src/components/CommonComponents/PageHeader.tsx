interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  inlineChildren?: boolean;
  titleClassName?: string;
  leftSlot?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children, inlineChildren = false, titleClassName, leftSlot }: PageHeaderProps) {
  const titleCls = titleClassName ?? 'text-lg font-semibold text-foreground';
  return (
    <div className={`flex items-center ${inlineChildren ? 'justify-between gap-3' : 'justify-between'} py-4 px-6 min-h-[64px]`}>
      {inlineChildren ? (
        <>
          {leftSlot ? (
            <div className="flex items-center min-w-0">{leftSlot}</div>
          ) : (
            <div className="flex flex-col">
              <h1 className={titleCls}>{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {children && <div className="flex items-center justify-end gap-8 flex-1 min-w-0 ml-8">{children}</div>}
        </>
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
