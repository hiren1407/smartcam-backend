# face_encoding.py
import sys
import face_recognition

def get_face_encodings(image_path):
    try:
        # Load the image file

        image = face_recognition.load_image_file(image_path)
        # Get the facial encodings
        face_encodings = face_recognition.face_encodings(image)

        if len(face_encodings) > 0:
            return face_encodings[0]  # return the first face encoding
        else:
            return None
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    image_path = sys.argv[1]
    encoding = get_face_encodings(image_path)
    if encoding is not None:
        print(encoding.tolist())  # convert to list for JSON serialization
    else:
        print("No face found")
