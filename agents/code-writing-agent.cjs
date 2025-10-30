const fs = require('fs');
const path = require('path');

module.exports = async function codeWritingAgent({ feature, outDir }) {
  if (!outDir) throw new Error('outDir required');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const patchPath = path.join(outDir, 'app-favorite.patch');
  const patch = `--- a/src/App.tsx\n+++ b/src/App.tsx\n@@
 import { Notifications, ChevronLeft, ChevronRight, Delete, Edit, Close } from '@mui/icons-material';
+import { Star, StarBorder } from '@mui/icons-material';
@@
 function App() {
+  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
@@
-                  <Stack>
+                  <Stack>
+                    <IconButton aria-label="즐겨찾기" onClick={() => {
+                      const id = event.id;
+                      setFavoriteIds(fav => fav.includes(id) ? fav.filter(x => x !== id) : [...fav, id]);
+                    }}>
+                      {favoriteIds.includes(event.id)
+                        ? <Star data-testid="StarIcon" color="warning" />
+                        : <StarBorder data-testid="StarBorderIcon" />}
+                    </IconButton>
 `;
  fs.writeFileSync(patchPath, patch, 'utf-8');
  return { patchPath };
};
