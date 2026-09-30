// Wrapper de Material Symbols Rounded (peso 500, ver index.html e index.css).
export default function Icon({ name, className = '', style }) {
  return (
    <span className={`material-symbols-rounded select-none leading-none ${className}`} style={style} aria-hidden="true">
      {name}
    </span>
  )
}
