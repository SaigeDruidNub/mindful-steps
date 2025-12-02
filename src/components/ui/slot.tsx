import * as React from "react"

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    const child = React.Children.only(children) as React.ReactElement
    const childRef = (child as any).ref

    return React.cloneElement(child, {
      ...props,
      ...child.props,
      ref: ref ? (node: any) => {
        childRef(node)
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as any).current = node
      } : childRef
    })
  }
)

Slot.displayName = "Slot"

export { Slot }