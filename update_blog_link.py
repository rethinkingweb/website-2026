import os

OLD = 'href="blog.html"'
NEW = 'href="https://rtw-blog.vercel.app/blog"'

root_dir = "."
count = 0
for dirpath, _, filenames in os.walk(root_dir):
    for fname in filenames:
        if fname.endswith(".html"):
            fpath = os.path.join(dirpath, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
            if OLD in content:
                replaced = content.count(OLD)
                content = content.replace(OLD, NEW)
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(content)
                count += replaced
                print(f"Updated {replaced}x in: {fpath}")

print(f"\nDone. {count} total replacements.")