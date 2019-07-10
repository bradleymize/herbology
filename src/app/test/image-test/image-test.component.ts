import { Component } from '@angular/core';
import {ImageUtilService} from "../../services/image-util.service";

@Component({
  selector: 'app-image-test',
  templateUrl: './image-test.component.html',
  styleUrls: ['./image-test.component.scss']
})
export class ImageTestComponent {
  constructor() { }

  clearContainer(container, rootElement) {
    while(container.lastChild !== rootElement) {
      container.lastChild.remove();
    }
  }

  transform() {
    const image = document.getElementById("original") as HTMLImageElement;
    const imageContainer = document.getElementById("image-container");
    const canvases = [];
    const filters = [
      ImageUtilService.grayscale,
      image => ImageUtilService.brightness(image, -50),
      ImageUtilService.invert,
      image => ImageUtilService.brightness(ImageUtilService.invert(image), -50),
      image => ImageUtilService.brightness(image, 0),
      image => ImageUtilService.brightness(image, 50),
      image => ImageUtilService.contrast(image, -50),
      image => ImageUtilService.contrast(image, 0),
      image => ImageUtilService.contrast(image, 50),
      image => ImageUtilService.convolute(image, ImageUtilService.SHARPEN, true),
      image => ImageUtilService.convolute(image, ImageUtilService.VERTICAL_EDGE, true),
      image => ImageUtilService.convolute(image, ImageUtilService.HORIZONTAL_EDGE, true),
      image => ImageUtilService.convolute(image, ImageUtilService.VERTICAL_HORIZONTAL_EDGE, true),
      image => ImageUtilService.convolute(image, ImageUtilService.EDGE, true),
      image => ImageUtilService.convolute(image, ImageUtilService.LAPLACE, true),
      image => ImageUtilService.convolute(image, ImageUtilService.GAUSSIAN_3, true),
      image => ImageUtilService.convolute(image, ImageUtilService.UNSHARP_MASK, true)
    ];

    this.clearContainer(imageContainer, image);

    filters.forEach(filter => canvases.push(filter(image)));
    canvases.forEach(canvas => imageContainer.appendChild(canvas));
  }
}
