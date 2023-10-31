from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import cv2
import numpy as np
import imutils
from imutils.perspective import four_point_transform
from skimage.filters import threshold_local

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/post-image', methods=['POST'])
def post_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'})

    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No selected image'})

    if image:
        # Save the image with the name 'image_original.jpg'
        filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image_original.jpg')
        image.save(filename)

        # Load the image using OpenCV
        image = cv2.imread(filename)
        ratio = image.shape[0] / 500.0
        orig = image.copy()
        image = imutils.resize(image, height=500)

        # Convert the image to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Save the grayscale image
        gray_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image_gray.jpg')
        cv2.imwrite(gray_filename, gray)

        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        # Save the grayscale image
        blur_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image_blur.jpg')
        cv2.imwrite(blur_filename, blur)

        _, threshold = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        threshold_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image_thresholded.jpg')
        cv2.imwrite(threshold_filename, threshold)

        edged = cv2.Canny(gray, 75, 200)
        # Save the preprocessed (edged) image
        edged_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image_edged.jpg')
        cv2.imwrite(edged_filename, edged)

        # find the contours in the edged image, keeping only the
        # largest ones, and initialize the screen contour
        cnts = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        cnts = imutils.grab_contours(cnts)
        cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:5]

        # loop over the contours
        for c in cnts:
            # approximate the contour
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)

            # if our approximated contour has four points, then we can assume that we have found our screen
            if len(approx) == 4:
                screenCnt = approx
                break
        
        if len(approx) != 4:
            # Try finding contours in the thresholded image
            cnts = cv2.findContours(threshold, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
            cnts = imutils.grab_contours(cnts)
            cnts = sorted(cnts, key=cv2.contourArea, reverse=True)[:5]

        for c in cnts:
            # approximate the contour
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.02 * peri, True)

            # if our approximated contour has four points, then we can assume that we have found our screen
            if len(approx) == 4:
                screenCnt = approx
                break

        cv2.drawContours(image, [screenCnt], -1, (0, 255, 0), 2)
        cnts_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image_cnts.jpg')
        cv2.imwrite(cnts_filename, image)

        # Apply four-point perspective transform to the original image
        warped = four_point_transform(orig, screenCnt.reshape(4, 2) * ratio)
        warped = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)

        T = threshold_local(warped, 11, offset = 10, method = "gaussian")
        warped = (warped > T).astype("uint8") * 255

        # Save the transformed image
        warped_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image_warped.jpg')
        cv2.imwrite(warped_filename, warped)

        margin = 4  # You can adjust this value to control the amount of cropping
        height, width = warped.shape[:2]
        warped_cropped = warped[margin:height-margin, margin:width-margin]

        # Save the cropped and transformed image
        warped_cropped_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'image_warped_cropped.jpg')
        cv2.imwrite(warped_cropped_filename, warped_cropped)

        return jsonify({'message': 'Image uploaded, preprocessed, and transformed successfully'})

@app.route('/get-image', methods=['GET'])
def get_image():
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'image_warped_cropped.jpg')
    if not os.path.exists(image_path):
        return jsonify({'error': 'Image not found'})

    return send_file(image_path, as_attachment=True)

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=3002)
