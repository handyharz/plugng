# Bulk Category Import Explanation

This document explains the structure and logic of the sample CSV provided for bulk category imports. The sample demonstrates how to build a 3-level hierarchy and expand existing categories in a single upload.

## Sample Data Overview

```csv
name,parent,description,image
"Sony","","High-quality Japanese electronics and smartphone brand","..."
"Audio & Sound","Sony","Headphones, Speakers and Audio Gear",""
"Wireless Noise Cancelling","Audio & Sound","Premium wireless audio experience",""
"Gaming Accessories","Sony","Gaming controllers and mobile accessories",""
"Wearables","Xiaomi","Smart watches and fitness trackers",""
"Smart Watches","Wearables","High-resolution AMOLED smart watches",""
"Bands & Straps","Wearables","Durable and stylish fitness bands",""
"Laptop Accessories","Infinix","Bags and chargers for Infinix laptops",""
"Power Solutions","Oraimo","High capacity charging bricks and solar banks",""
"GaN Chargers","Power Solutions","Compact and high-speed GaN technology",""
```

## How the Import Works

### 1. Sequential Processing 🔄
The system processes the CSV file **line by line (top to bottom)**. This order is critical because subcategories rely on their parents existing first.

### 2. Multi-Level & Multi-Branch Hierarchy 🏗️
The sample demonstrates building a realistic, multi-branch tree for **Sony**:
- **Branch A**: `Sony` (L1) → `Audio & Sound` (L2) → `Wireless Noise Cancelling` (L3).
- **Branch B**: `Sony` (L1) → `Gaming Accessories` (L2).

This is **fully expected** and shows that a single parent can have multiple "Sibling" subcategories, allowing you to organize a brand's entire product line (Audio, Gaming, Mobile, etc.) under one Brand heading.

### 3. Expansion of Existing Brands 📈
It also shows how to add new branches to brands already in your database:
- **Xiaomi**: Adds `Wearables` (L2), then adds `Smart Watches` and `Bands & Straps` (L3) under it.
- **Infinix**: Adds `Laptop Accessories` (L2).
- **Oraimo**: Adds `Power Solutions` (L2) and a specific `GaN Chargers` (L3) category.

### 4. Dynamic Name Resolution 🔍
You don't need database IDs. The system is smart enough to:
- Resolve "Sony" to its new ID immediately after it's created.
- Resolve "Audio & Sound" to its ID in the same session.

## Column Definitions

| Column | Requirement | Description |
| :--- | :--- | :--- |
| **name** | Required | The unique name of the category (e.g., "Apple", "Cases"). |
| **parent** | Optional | The exact name of the parent category. Leave empty for Level 1 Brands. |
| **description**| Optional | A brief summary of what the category contains. |
| **image** | Optional | A direct URL to an icon or representative image (e.g., `https://...`). |

## Pro-Tips for Success 💡
- **Check Spelling**: Parent names must exactly match the `name` column (case-insensitive).
- **Order Matters**: Always place a Parent category on a line **above** its children.
## How to Create Your Own CSV 🛠️

Follow these simple steps to prepare your own bulk category list using Excel, Google Sheets, or a text editor.

### Step 1: Set Up your Spreadsheet
Open Excel or Google Sheets and create 4 columns with these exact headers:
1. `name`
2. `parent`
3. `description`
4. `image`

### Step 2: Plan Your Hierarchy (The "Top-Down" Rule)
This is the most important step. Always write the **Parent** before the **Child**.

**Example Plan:**
- Line 1: `Apple` (Level 1 - Parent empty)
- Line 2: `iPhones` (Level 2 - Parent is Apple)
- Line 3: `iPhone 15 Series` (Level 3 - Parent is iPhones)

### Step 3: Fill in the Details
- **Names**: Keep them concise but descriptive.
- **Parents**: Must exactly match the name of a category already in the database OR one you defined in a row above.
- **Descriptions**: Optional, but helps customers understand the section.
- **Images**: Paste direct image links (URLs ending in `.png`, `.jpg`, etc.).

### Step 4: Export to CSV
1. In your spreadsheet software, go to **File > Download** or **Save As**.
2. Select **Comma Separated Values (.csv)**.
3. Keep the "UTF-8" encoding if prompted (standard for all systems).

### Step 5: Validate & Upload
- Open your `.csv` file in a text editor (like Notepad or TextEdit) just to ensure there are no extra commas or strange symbols.
- Go to the **Category Management** dashboard and click **Bulk Import**!

---

## Quick Checklist 📝
- [ ] No duplicate category names.
- [ ] Parents are spelled correctly.
- [ ] Every Child has its Parent on a line **above** it.
## Hierarchy Recipes (3 Sample Sequences) 👨‍🍳

Here are 3 common ways to structure your data. You can copy and paste these directly into your CSV file.

### Recipe 1: The Tech Brand Ecosystem (Apple)
*Focus: Creating a deep 3-level tree from scratch.*
```csv
name,parent,description,image
"Apple","","Premium iPhone and Mac accessories",""
"iPhones","Apple","Covers, Screen Protectors and more",""
"iPhone 15 Series","iPhones","Specific accessories for 15, 15 Pro, 15 Max",""
```

### Recipe 2: The Multi-Category Brand (Sony Gaming)
*Focus: Creating siblings at the same level.*
```csv
name,parent,description,image
"Sony","","Electronics & Gaming",""
"PlayStation 5","Sony","Console and controller skins",""
"PS5 Controllers","PlayStation 5","DualSense skins and thumb grips",""
"Audio Gear","Sony","Headphones and Bluetooth speakers",""
```

### Recipe 3: General Category Expansion (Chargers)
*Focus: Adding specific sub-types to an existing brand.*
```csv
name,parent,description,image
"Chargers & Cables","Samsung","Power accessories for Galaxy",""
"Super Fast Chargers","Chargers & Cables","45W and 65W charging bricks",""
"Braided Cables","Chargers & Cables","Extra durable nylon braided cables",""
```
