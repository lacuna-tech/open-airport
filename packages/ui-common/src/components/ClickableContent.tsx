import { ClickableContentProps } from '../types'

type ClickableContentBinderProps = (props: { onClick: () => void; content: ClickableContentProps }) => JSX.Element

/** Useful when passing specific JSX content into generic space where the generic space can inject click handler behavior. */
export const BindClickableContent: ClickableContentBinderProps = ({ onClick, content }) => content({ onClick })
