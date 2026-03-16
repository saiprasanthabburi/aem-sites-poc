#!/bin/bash
#
# Download images from correct source URLs and upload to AEM DAM
#
# Usage:
#   ./tools/importer/upload-to-dam.sh <ACCESS_TOKEN>
#
# How to get your access token:
#   1. Go to https://author-p35055-e1966368.adobeaemcloud.com/system/console/developerconsole
#   2. Or use Cloud Manager Developer Console
#   3. Click "Get Local Development Token" under "Integrations" tab
#   4. Copy the accessToken value
#

set -e

AEM_HOST="https://author-p35055-e1966368.adobeaemcloud.com"
DAM_BASE_PATH="/content/dam/ralphlaurencorporate"
DOWNLOAD_DIR="/tmp/dam-upload-images"
TOKEN="$1"

if [ -z "$TOKEN" ]; then
  echo "ERROR: Access token required"
  echo ""
  echo "Usage: ./tools/importer/upload-to-dam.sh <ACCESS_TOKEN>"
  echo ""
  echo "To get your access token:"
  echo "  1. Open: ${AEM_HOST}/system/console/developerconsole"
  echo "  2. Or use Cloud Manager Developer Console"
  echo "  3. Click 'Get Local Development Token' under Integrations tab"
  echo "  4. Copy the accessToken value"
  exit 1
fi

# Verify token works
echo "Verifying AEM connection..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer ${TOKEN}" \
  "${AEM_HOST}/api/assets.json")

if [ "$HTTP_CODE" != "200" ]; then
  echo "ERROR: Failed to connect to AEM (HTTP ${HTTP_CODE})"
  echo "Please check your access token is valid and not expired."
  exit 1
fi
echo "Connected to AEM successfully."
echo ""

# Track results
DOWNLOADED=0
UPLOADED=0
FAILED=0
SKIPPED=0

# Create temp download directory
mkdir -p "${DOWNLOAD_DIR}"

# ============================================================
# Image URL mapping: SOURCE_URL -> DAM_FOLDER/FILENAME
# ============================================================
# Format: "SOURCE_URL|DAM_SUBFOLDER|LOCAL_FILENAME"
#   DAM_SUBFOLDER is relative to DAM_BASE_PATH (empty = root)
# ============================================================

IMAGES=(
  # --- Homepage images (content/) ---
  "https://careers.ralphlauren.com/portal/4/images/home/HomePage_Banner.jpg||HomePage_Banner.jpg"
  "https://careers.ralphlauren.com/portal/4/images/home-1.jpg||home-1.jpg"
  "https://careers.ralphlauren.com/portal/4/images/home/HomeVertical-slide01.jpg||HomeVertical-slide01.jpg"
  "https://careers.ralphlauren.com/portal/4/images/home/HomeVertical-slide02.jpg||HomeVertical-slide02.jpg"
  "https://careers.ralphlauren.com/portal/4/images/home/HomeVertical-slide03.jpg||HomeVertical-slide03.jpg"
  "https://careers.ralphlauren.com/portal/4/images/home/HomeVertical-slide04.jpg||HomeVertical-slide04.jpg"
  "https://careers.ralphlauren.com/portal/4/images/home/HomeVertical-slide05.jpg||HomeVertical-slide05.jpg"
  "https://careers.ralphlauren.com/portal/4/images/home/RL_signature.png||RL_signature.png"

  # --- Your Career page images (content/careerscorporate/) ---
  "https://careers.ralphlauren.com/portal/4/images/career/YourCareer_Banner.jpg|careerscorporate|YourCareer_Banner.jpg"
  "https://careers.ralphlauren.com/portal/4/images/career/YourCareer_Join.jpg|careerscorporate|YourCareer_Join.jpg"
  "https://careers.ralphlauren.com/portal/4/images/career/YourCareer_Belong.jpg|careerscorporate|YourCareer_Belong.jpg"
  "https://careers.ralphlauren.com/portal/4/images/career/YourCareer_Inspire.jpg|careerscorporate|YourCareer_Inspire.jpg"
  "https://careers.ralphlauren.com/portal/4/images/career/YourCareerRecognize.jpg|careerscorporate|YourCareerRecognize.jpg"
  "https://careers.ralphlauren.com/portal/4/images/career/YourCareer_Learn.jpg|careerscorporate|YourCareer_Learn.jpg"
)

download_image() {
  local source_url="$1"
  local filename="$2"
  local dest="${DOWNLOAD_DIR}/${filename}"

  echo -n "  Downloading ${filename} ... "
  HTTP_CODE=$(curl -s -o "${dest}" -w "%{http_code}" -L "${source_url}")

  if [ "$HTTP_CODE" = "200" ]; then
    local size=$(wc -c < "${dest}" | tr -d ' ')
    echo "OK (${size} bytes)"
    DOWNLOADED=$((DOWNLOADED + 1))
    return 0
  else
    echo "FAILED (HTTP ${HTTP_CODE})"
    rm -f "${dest}"
    return 1
  fi
}

upload_image() {
  local file_path="$1"
  local dam_folder="$2"
  local filename=$(basename "$file_path")
  local mime_type

  case "${filename##*.}" in
    jpg|jpeg) mime_type="image/jpeg" ;;
    png) mime_type="image/png" ;;
    gif) mime_type="image/gif" ;;
    webp) mime_type="image/webp" ;;
    svg) mime_type="image/svg+xml" ;;
    *) mime_type="application/octet-stream" ;;
  esac

  echo -n "  Uploading ${filename} -> ${dam_folder}/ ... "

  # Ensure DAM folder exists
  curl -s -o /dev/null \
    -H "Authorization: Bearer ${TOKEN}" \
    -X POST \
    -F "jcr:primaryType=sling:OrderedFolder" \
    "${AEM_HOST}${dam_folder}" 2>/dev/null || true

  # Upload the image
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -X POST \
    -F "file=@${file_path};type=${mime_type}" \
    -F "jcr:primaryType=dam:Asset" \
    "${AEM_HOST}${dam_folder}/${filename}")

  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "OK (${HTTP_CODE})"
    UPLOADED=$((UPLOADED + 1))
  elif [ "$HTTP_CODE" = "409" ]; then
    echo "EXISTS (already in DAM)"
    SKIPPED=$((SKIPPED + 1))
  else
    echo "FAILED (HTTP ${HTTP_CODE})"
    FAILED=$((FAILED + 1))
  fi
}

# ============================================================
# Step 1: Download all images from correct source URLs
# ============================================================
echo "Step 1: Downloading images from source..."
echo ""

for entry in "${IMAGES[@]}"; do
  IFS='|' read -r source_url dam_subfolder filename <<< "$entry"
  download_image "$source_url" "$filename"
done

echo ""
echo "Downloaded: ${DOWNLOADED} / ${#IMAGES[@]}"
echo ""

# ============================================================
# Step 2: Upload downloaded images to AEM DAM
# ============================================================
echo "Step 2: Uploading to AEM DAM at ${DAM_BASE_PATH}..."
echo ""

for entry in "${IMAGES[@]}"; do
  IFS='|' read -r source_url dam_subfolder filename <<< "$entry"

  local_file="${DOWNLOAD_DIR}/${filename}"
  if [ ! -f "$local_file" ]; then
    echo "  SKIP ${filename} (download failed)"
    continue
  fi

  if [ -n "$dam_subfolder" ]; then
    dam_folder="${DAM_BASE_PATH}/${dam_subfolder}"
  else
    dam_folder="${DAM_BASE_PATH}"
  fi

  upload_image "$local_file" "$dam_folder"
done

# ============================================================
# Summary
# ============================================================
echo ""
echo "========================================"
echo "Upload Summary"
echo "========================================"
echo "  Downloaded: ${DOWNLOADED}"
echo "  Uploaded:   ${UPLOADED}"
echo "  Skipped:    ${SKIPPED} (already exist)"
echo "  Failed:     ${FAILED}"
echo "========================================"
echo ""
echo "Image URL -> DAM Path mapping:"
echo ""
for entry in "${IMAGES[@]}"; do
  IFS='|' read -r source_url dam_subfolder filename <<< "$entry"
  if [ -n "$dam_subfolder" ]; then
    echo "  ${source_url}"
    echo "    -> ${DAM_BASE_PATH}/${dam_subfolder}/${filename}"
  else
    echo "  ${source_url}"
    echo "    -> ${DAM_BASE_PATH}/${filename}"
  fi
done

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "WARNING: Some uploads failed. Check your permissions and try again."
  exit 1
fi

# Cleanup
rm -rf "${DOWNLOAD_DIR}"

echo ""
echo "Done! Images are now available in AEM DAM at:"
echo "  ${AEM_HOST}/assets.html${DAM_BASE_PATH}"
