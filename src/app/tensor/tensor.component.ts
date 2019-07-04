import {Component} from '@angular/core';
import * as tf from '@tensorflow/tfjs';

// This is a helper class for loading and managing MNIST data specifically.
// It is a useful example of how you could create your own data manager class
// for arbitrary data though. It's worth a look :)
import {MnistData} from './data';

@Component({
  selector: 'app-tensor',
  templateUrl: './tensor.component.html',
  styleUrls: ['./tensor.component.scss']
})
export class TensorComponent {
  data;
  ui;
  initialized = false;
  ready = false;
  readonly IMAGE_H = 28;
  readonly IMAGE_W = 28;
  readonly SAVE_PATH= 'indexeddb://number-model';

  constructor() {}

  async start() {
    this.initialized = true;
    console.log("Loading ui module...");
    this.ui = await import('./ui');
    console.log("UI module loaded.");
    this.ready = true;
    this.ui.setTrainButtonCallback(async () => {
      this.ui.logStatus('Loading MNIST data...');
      await this.load();

      let model;
      try {
        model = await tf.loadLayersModel(this.SAVE_PATH);
      } catch(e) {}

      if(model) {
        console.log('Loaded existing model:');
        this.ui.logStatus('Loaded existing model.');
        model.summary();

        this.showPredictions(model);
      } else {
        this.ui.logStatus('Creating model...');
        model = this.createConvModel();
        model.summary();

        this.ui.logStatus('Starting model training...');
        await this.train(model, () => this.showPredictions(model));
      }
    });
  }

  async load() {
    this.data = new MnistData();
    <any>await this.data.load();
  }

  /**
   * Creates a convolutional neural network (Convnet) for the MNIST data.
   */
  createConvModel() {
    // Create a sequential neural network model. tf.sequential provides an API
    // for creating "stacked" models where the output from one layer is used as
    // the input to the next layer.
    const model = tf.sequential();

    // The first layer of the convolutional neural network plays a dual role:
    // it is both the input layer of the neural network and a layer that performs
    // the first convolution operation on the input. It receives the 28x28 pixels
    // black and white images. This input layer uses 16 filters with a kernel size
    // of 5 pixels each. It uses a simple RELU activation function which pretty
    // much just looks like this: __/
    model.add(tf.layers.conv2d({
      inputShape: [this.IMAGE_H, this.IMAGE_W, 1],
      kernelSize: 3,
      filters: 16,
      activation: 'relu'
    }));

    // After the first layer we include a MaxPooling layer. This acts as a sort of
    // downsampling using max values in a region instead of averaging.
    // https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks
    model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));

    // Our third layer is another convolution, this time with 32 filters.
    model.add(tf.layers.conv2d({kernelSize: 3, filters: 32, activation: 'relu'}));

    // Max pooling again.
    model.add(tf.layers.maxPooling2d({poolSize: 2, strides: 2}));

    // Add another conv2d layer.
    model.add(tf.layers.conv2d({kernelSize: 3, filters: 32, activation: 'relu'}));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten({}));

    model.add(tf.layers.dense({units: 64, activation: 'relu'}));

    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Here the classes actually
    // represent numbers, but it's the same idea if you had classes that
    // represented other entities like dogs and cats (two output classes: 0, 1).
    // We use the softmax function as the activation for the output layer as it
    // creates a probability distribution over our 10 classes so their output
    // values sum to 1.
    model.add(tf.layers.dense({units: 10, activation: 'softmax'}));

    return model;
  }

  /**
   * Compile and train the given model.
   *
   * @param model The model to train.
   * @param onIteration A callback to execute every 10 batches & epoch end.
   */
  async train(model, onIteration) {
    this.ui.logStatus('Training model...');

    // Now that we've defined our model, we will define our optimizer. The
    // optimizer will be used to optimize our model's weight values during
    // training so that we can decrease our training loss and increase our
    // classification accuracy.

    // We are using rmsprop as our optimizer.
    // An optimizer is an iterative method for minimizing an loss function.
    // It tries to find the minimum of our loss function with respect to the
    // model's weight parameters.
    const optimizer = 'rmsprop';

    // We compile our model by specifying an optimizer, a loss function, and a
    // list of metrics that we will use for model evaluation. Here we're using a
    // categorical crossentropy loss, the standard choice for a multi-class
    // classification problem like MNIST digits.
    // The categorical crossentropy loss is differentiable and hence makes
    // model training possible. But it is not amenable to easy interpretation
    // by a human. This is why we include a "metric", namely accuracy, which is
    // simply a measure of how many of the examples are classified correctly.
    // This metric is not differentiable and hence cannot be used as the loss
    // function of the model.
    model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    // Batch size is another important hyperparameter. It defines the number of
    // examples we group together, or batch, between updates to the model's
    // weights during training. A value that is too low will update weights using
    // too few examples and will not generalize well. Larger batch sizes require
    // more memory resources and aren't guaranteed to perform better.
    const batchSize = 320;

    // Leave out the last 15% of the training data for validation, to monitor
    // overfitting during training.
    const validationSplit = 0.15;

    // Get number of training epochs from the UI.
    const trainEpochs = this.ui.getTrainEpochs();

    // We'll keep a buffer of loss and accuracy values over time.
    let trainBatchCount = 0;

    const trainData = this.data.getTrainData();
    const testData = this.data.getTestData();

    const totalNumBatches =
      Math.ceil(trainData.xs.shape[0] * (1 - validationSplit) / batchSize) *
      trainEpochs;

    // During the long-running fit() call for model training, we include
    // callbacks, so that we can plot the loss and accuracy values in the page
    // as the training progresses.
    let valAcc;
    await model.fit(trainData.xs, trainData.labels, {
      batchSize,
      validationSplit,
      epochs: trainEpochs,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          trainBatchCount++;
          this.ui.logStatus(
            `Training... (` +
            `${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%` +
            ` complete). To stop training, refresh or close page.`);
          this.ui.plotLoss(trainBatchCount, logs.loss, 'train');
          this.ui.plotAccuracy(trainBatchCount, logs.acc, 'train');
          if (onIteration && batch % 10 === 0) {
            onIteration('onBatchEnd', batch, logs);
          }
          await tf.nextFrame();
        },
        onEpochEnd: async (epoch, logs) => {
          valAcc = logs.val_acc;
          this.ui.plotLoss(trainBatchCount, logs.val_loss, 'validation');
          this.ui.plotAccuracy(trainBatchCount, logs.val_acc, 'validation');
          if (onIteration) {
            onIteration('onEpochEnd', epoch, logs);
          }
          await tf.nextFrame();
        }
      }
    });

    console.log('Saving model to indexeddb...');
    await model.save(this.SAVE_PATH);
    console.log('Model saved.');

    const testResult = model.evaluate(testData.xs, testData.labels);
    const testAccPercent = testResult[1].dataSync()[0] * 100;
    const finalValAccPercent = valAcc * 100;
    this.ui.logStatus(
      `Final validation accuracy: ${finalValAccPercent.toFixed(1)}%; ` +
      `Final test accuracy: ${testAccPercent.toFixed(1)}%`);
  }

  /**
   * Show predictions on a number of test examples.
   */
  async showPredictions(model) {
    const testExamples = 5;
    const examples = this.data.getTestData(testExamples);

    // Code wrapped in a tf.tidy() function callback will have their tensors freed
    // from GPU memory after execution without having to call dispose().
    // The tf.tidy callback runs synchronously.
    tf.tidy(() => {
      const output = model.predict(examples.xs);

      // tf.argMax() returns the indices of the maximum values in the tensor along
      // a specific axis. Categorical classification tasks like this one often
      // represent classes as one-hot vectors. One-hot vectors are 1D vectors with
      // one element for each output class. All values in the vector are 0
      // except for one, which has a value of 1 (e.g. [0, 0, 0, 1, 0]). The
      // output from model.predict() will be a probability distribution, so we use
      // argMax to get the index of the vector element that has the highest
      // probability. This is our prediction.
      // (e.g. argmax([0.07, 0.1, 0.03, 0.75, 0.05]) == 3)
      // dataSync() synchronously downloads the tf.tensor values from the GPU so
      // that we can use them in our normal CPU JavaScript code
      // (for a non-blocking version of this function, use data()).
      const axis = 1;
      const labels = Array.from(examples.labels.argMax(axis).dataSync());
      const predictions = Array.from(output.argMax(axis).dataSync());

      this.ui.showTestResults(examples, predictions, labels);
    });
  }
}
