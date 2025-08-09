#!/bin/bash

PROJECT_NAME=$(basename "$PWD")
DATE=$(date '+%Y-%m-%d %H:%M:%S')
echo "📌 Writing handoff for $PROJECT_NAME at $DATE"

cat <<EOF > handoff.md
# Handoff Anchor — $PROJECT_NAME
🗓 Last touched: $DATE

🎯 Current Focus:
- [ ] Document what’s complete
- [ ] Note what’s unresolved
- [ ] Identify what’s next

🔜 Next Steps:
- [ ] ...

🧠 Context Notes:
- ...
EOF

echo "✅ Handoff.md created"
cat handoff.md
