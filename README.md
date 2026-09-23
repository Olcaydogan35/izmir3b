# Şehrimiz İzmir 3B Galeri

Yedi 3B eseri gösteren statik web uygulaması. Derleme veya sunucu tarafı kod gerektirmez.

## Yerelde çalıştırma

Bu klasörde bir statik HTTP sunucusu başlatın:

```powershell
python -m http.server 8000
```

Ardından `http://localhost:8000` adresini açın. GLB dosyaları nedeniyle sayfayı doğrudan `file://` adresinden açmayın.

## Webe yükleme

`index.html`, `app.js`, `catalog.js`, `siluet.png` ve `models/` klasörünü aynı dizin yapısıyla statik web sunucusuna yükleyin. `index.html` yayın kökünde veya seçilen alt dizinde bulunabilir; dosya yolları görecelidir. HTTPS kullanın.

Sayfa, Google CDN üzerindeki `model-viewer` 4.0.0 modülünü yükler. CDN erişimi yoksa 3B görüntüleme çalışmaz; bu durumda modülü yerel olarak barındırmak gerekir.

Modellerin toplam boyutu yaklaşık 82,7 MB'dir. Yayın öncesinde mobil bağlantıdaki açılış süresini ölçün; gerekiyorsa modelleri ve dokuları sıkıştırın.

### GitHub Pages ile test

Projeyi ZIP olarak yüklemeyin. GitHub'ın tarayıcı yükleme sınırı **dosya başına 25 MiB**; mevcut GLB dosyalarının hepsi bunun altındadır. `index.html`, `app.js`, `catalog.js`, `siluet.png`, `.nojekyll` ve `models/` klasörünü aynı dizin yapısıyla depoya yükleyin. `.nojekyll`, bu statik sitenin Jekyll derlemesine sokulmasını önler. GLB dosyaları için Git LFS kullanmayın; GitHub Pages LFS dosyalarını yayınlamaz.

Depoda **Settings → Pages → Build and deployment → Deploy from a branch** seçin. Dal olarak `main`, klasör olarak `/(root)` seçip kaydedin. Yayın adresi Pages ekranında görünür. GitHub Pages'in [yayın kaynağı kılavuzu](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) ve [dosya boyutu sınırları](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github) güncel ayrıntıları içerir.

## Model ekleme ve güncelleme

Model dosyasını `models/` klasörüne koyun. Ardından yalnızca `catalog.js` dosyasına yeni bir eser kaydı ekleyin veya mevcut kaydın `model` yolunu değiştirin. Kayıtların sırası galeri kartlarının ve **Önceki/Sonraki** gezinmesinin sırasıdır. İlk kayıt açılışta seçilir.

Her kayıtta benzersiz bir anahtar ve `name`, `model`, `life`, `summary`, `facts` alanları bulunmalıdır. `cardName`, `short`, `category`, `badge` ve `thumbnail` isteğe bağlıdır. `facts`, `[başlık, açıklama]` çiftlerinden oluşur.

```js
yeniEser: {
  name: 'Yeni Eser',
  short: 'Kartın kısa açıklaması',
  category: 'Tarihi Yapılar',
  life: 'Tarih veya dönem',
  model: 'models/yeni-eser.glb',
  thumbnail: 'thumbnails/yeni-eser.webp', // İsteğe bağlı
  summary: 'Eserin kısa tanıtımı.',
  facts: [['Özellik', 'Açıklama']],
  badge: 'Ek bilgi'
}
```

`thumbnail` verilmezse kartta modelin 3B önizlemesi gösterilir. Eser sayısı arttıkça statik WebP/AVIF küçük görseller kullanmak açılışı hızlandırır. Küçük görsel kullanırsanız onun klasörünü de web sunucusuna yükleyin.

## 3B kontrol sınırları

Model yatay eksende tam tur döndürülebilir. Dikey kamera açısı 65° ile 85° arasında tutulur. Başlangıç uzaklığı %105, en yakın uzaklık %87,5 olduğu için en fazla 1,20× yakınlaştırılır. Model yüklenirken gerçek yükleme ilerlemesi yüzde olarak gösterilir.
