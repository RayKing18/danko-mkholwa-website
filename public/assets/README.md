# Danko Mkholwa brand assets

Place the ORIGINAL artwork here. The website already points at these exact
file names, so nothing in the code needs to change.

| File | Used for |
|------|----------|
| `logo/danko-mkholwa-logo.png` | Header, footer, hero, loading screen (transparent PNG preferred) |
| `logo/icon-192.png` | PWA home-screen icon, 192×192, square (logo on black) |
| `logo/icon-512.png` | PWA home-screen icon, 512×512, square (logo on black) |
| `products/cheeseburger.jpg` | Cheeseburger — R60 |
| `products/double-cheeseburger.jpg` | Danko Is Thank You Double Cheeseburger — R80 |
| `products/blueberry-mint-mojito.jpg` | Blueberry Mint Mojito — R25 |
| `products/sweet-berry-breeze.jpg` | Sweet Berry Breeze — R25 |
| `promotions/double-cheeseburger-poster.jpg` | Promotional poster on the homepage |
| `promotions/menu-poster.jpg` | Menu poster (Contact / Menu page download) |

Tip: the owner can ALSO upload the logo and product photos from the
dashboard (Admin → Upload Centre) without touching these files. Uploaded
images are stored in the database and served from `/api/media/<id>`.
If an uploaded logo exists it takes priority; the PWA icons are then
generated automatically at `/api/icon/192` and `/api/icon/512`.
