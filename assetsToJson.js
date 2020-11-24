const fs = require('fs').promises;
const assets_dir = "./src/assets"
const designs_dir = "./src/assets/designs"
const assets_json_path = "./src/assets.json"

const assets_to_json = async () => {
    let files = await fs.readdir(assets_dir, "utf-8")
    let assets = {
        designs: []
    }

    for (let file of files) {
        if (file === "designs") continue
        else {
            const path = `${assets_dir}/${file}`
            const name = file.replace(/\..+/, "")
            const content = await fs.readFile(path, "utf-8")
            assets[name] = content
        }
    }

    files = await fs.readdir(designs_dir, "utf-8")
    for (let file of files) {
        const path = `${designs_dir}/${file}`
        const name = file.replace(/\..+/, "")
        const content = await fs.readFile(path, "utf-8")
        assets["designs"].push(`${name}:${content}`)
    }

    await fs.writeFile(assets_json_path, JSON.stringify(assets, null, '    '))
}

assets_to_json()