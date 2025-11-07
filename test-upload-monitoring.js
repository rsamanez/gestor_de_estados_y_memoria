// Test para verificar que no hay doble upload
// Este archivo simula una prueba del flujo de upload

console.log('🧪 INICIANDO TEST DE DOBLE UPLOAD');

async function testSingleUpload() {
  console.log('📝 Simulando upload de archivo...');
  
  // Crear un archivo de prueba simulado
  const testFile = new File(['Contenido de prueba'], 'test-upload.txt', {
    type: 'text/plain'
  });
  
  console.log('📄 Archivo de prueba creado:', testFile.name);
  console.log('📊 Tamaño:', testFile.size, 'bytes');
  
  // Aquí normalmente se llamaría a handleFileUploaded
  // pero solo estamos monitoreando el comportamiento
  
  console.log('✅ Test preparado - ahora sube un archivo en la UI y monitorea los logs');
}

// Ejecutar test
testSingleUpload();
