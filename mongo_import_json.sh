for f in *.json
do
    filename=$(basename "$f")
    extension="${filename##*.}"
    filename="${filename%.*}"
    mongoimport -d datadb -c "$filename" --type json --file "$f" 
done
