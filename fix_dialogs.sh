#!/bin/bash
# Remove duplicate delete dialogs - keep only the last one

# Work backwards to avoid line number shifting
sed -i '' '919,945d' frontend/src/components/Dashboard.jsx  # Dialog 23 (last one we keep)
sed -i '' '885,911d' frontend/src/components/Dashboard.jsx  # Dialog 22
sed -i '' '854,880d' frontend/src/components/Dashboard.jsx  # Dialog 21
sed -i '' '825,851d' frontend/src/components/Dashboard.jsx  # Dialog 20
sed -i '' '785,811d' frontend/src/components/Dashboard.jsx  # Dialog 19
sed -i '' '756,782d' frontend/src/components/Dashboard.jsx  # Dialog 18
sed -i '' '727,753d' frontend/src/components/Dashboard.jsx  # Dialog 17
sed -i '' '682,708d' frontend/src/components/Dashboard.jsx  # Dialog 16
sed -i '' '643,669d' frontend/src/components/Dashboard.jsx  # Dialog 15
sed -i '' '599,625d' frontend/src/components/Dashboard.jsx  # Dialog 14
sed -i '' '567,593d' frontend/src/components/Dashboard.jsx  # Dialog 13
sed -i '' '533,559d' frontend/src/components/Dashboard.jsx  # Dialog 12
sed -i '' '498,524d' frontend/src/components/Dashboard.jsx  # Dialog 11
sed -i '' '456,482d' frontend/src/components/Dashboard.jsx  # Dialog 10
sed -i '' '425,451d' frontend/src/components/Dashboard.jsx  # Dialog 9
sed -i '' '396,422d' frontend/src/components/Dashboard.jsx  # Dialog 8
sed -i '' '351,377d' frontend/src/components/Dashboard.jsx  # Dialog 7
sed -i '' '319,345d' frontend/src/components/Dashboard.jsx  # Dialog 6
sed -i '' '266,292d' frontend/src/components/Dashboard.jsx  # Dialog 5
sed -i '' '232,258d' frontend/src/components/Dashboard.jsx  # Dialog 4
sed -i '' '203,229d' frontend/src/components/Dashboard.jsx  # Dialog 3
sed -i '' '172,198d' frontend/src/components/Dashboard.jsx  # Dialog 2
sed -i '' '132,158d' frontend/src/components/Dashboard.jsx  # Dialog 1

echo "Removed duplicate delete dialogs - kept only the last one"
