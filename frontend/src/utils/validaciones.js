// Validación de RUT chileno con dígito verificador
export function validarRut(rut) {
  if (!rut) return false
  // Limpiar puntos y guión
  const limpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
  if (limpio.length < 2) return false

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)

  if (!/^\d+$/.test(cuerpo)) return false

  // Calcular dígito verificador
  let suma = 0
  let multiplo = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }
  const resto = 11 - (suma % 11)
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)

  return dv === dvEsperado
}

// Formatea el RUT mientras se escribe: 12345678-9 → 12.345.678-9
export function formatearRut(rut) {
  let limpio = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (limpio.length < 2) return limpio

  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)

  // Agregar puntos
  let cuerpoFormateado = ''
  for (let i = 0; i < cuerpo.length; i++) {
    if (i > 0 && (cuerpo.length - i) % 3 === 0) {
      cuerpoFormateado += '.'
    }
    cuerpoFormateado += cuerpo[i]
  }

  return `${cuerpoFormateado}-${dv}`
}

// Validación de email
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Validación de teléfono chileno (+56 9 XXXX XXXX o variantes)
export function validarTelefono(telefono) {
  if (!telefono) return true // opcional
  const limpio = telefono.replace(/\s/g, '').replace(/\+/g, '')
  // Acepta 9XXXXXXXX (9 dígitos) o 569XXXXXXXX (11 dígitos)
  return /^(56)?9\d{8}$/.test(limpio)
}

// Validación de contraseña
export function validarPassword(password) {
  return password && password.length >= 6
}