// Wrapper de Material Icons Round.
export default function Icon({ name, className = '', style }) {
  return (
    <span className={`material-icons-round select-none leading-none ${className}`} style={style} aria-hidden="true">
      {name}
    </span>
  )
}
