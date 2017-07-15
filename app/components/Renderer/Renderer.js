/* @flow */

import React from 'react';
import React3 from 'react-three-renderer';
import * as THREE from 'three';

import ContainerProvider from './ContainerProvider';
import { FOV } from './constants';

type RendererProps = {
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  near: number,
  far: number,
  children: React$Component<*, *, *>,
  cameraRef: (THREE.Camera) => void,
  onMouseDown: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  onMouseMove: (Event) => void, // eslint-disable-line react/no-unused-prop-types
  onMouseUp: (Event) => void, // eslint-disable-line react/no-unused-prop-types
};

const propsEvents = {
  mousedown: 'onMouseDown',
  mousemove: 'onMouseMove',
  mouseup: 'onMouseUp',
};

export default class Renderer extends React.PureComponent {
  static defaultProps: {
    onMouseDown: null,
    onMouseMove: null,
    onMouseUp: null,
    cameraRef: null,
  }

  constructor(props: RendererProps) {
    super(props);
    this.raycaster = new THREE.Raycaster();
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.redispatchMouseEvent.bind(this));
    window.addEventListener('mousemove', this.redispatchMouseEvent.bind(this));
  }

  setCameraRef = (ref: THREE.Camera) => {
    this.camera = ref;
    if (this.props.cameraRef) {
      this.props.cameraRef(ref);
    }
  };

  handleClick = this.redispatchMouseEvent.bind(this);
  handleMouseDown = this.redispatchMouseEvent.bind(this);

  redispatchMouseEvent(event: { type: string, nativeEvent: MouseEvent } & SyntheticEvent) {
    const rendererEvent = this.props[propsEvents[event.type]];
    const nativeEvent = event.nativeEvent || event;

    if (!event.nativeEvent) {
      const wrapped = event.stopPropagation;
      let propagationStopped = false;

      // $FlowFixMe
      event.stopPropagation = () => { // eslint-disable-line no-param-reassign
        propagationStopped = true;
        wrapped();
      };

      // $FlowFixMe
      event.isPropagationStopped = () => propagationStopped; // eslint-disable-line no-param-reassign
    }

    if (rendererEvent) {
      rendererEvent(event);

      if (event.defaultPrevented || (event.isDefaultPrevented && event.isDefaultPrevented())) {
        return;
      }
    }

    const { offsetX, offsetY } = nativeEvent;
    const { width, height } = this.props;

    const x = offsetX / width;
    const y = offsetY / height;
    const coords = new THREE.Vector2((x * 2) - 1, -(y * 2) + 1);

    this.raycaster.setFromCamera(coords, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    intersects.every((details) => {
      const { dispatchHitRegionMouseEvent: dispatchEvent } = details.object.userData;

      if (dispatchEvent) {
        const areaEvent = dispatchEvent(event.type, event, details);
        return !areaEvent.isPropagationStopped();
      }

      return true;
    });
  }

  props: RendererProps;
  raycaster: THREE.Raycaster;
  scene: THREE.Scene;
  camera: THREE.Camera;

  render() {
    const { x, y, z, width, height, near, far, children } = this.props;

    return (
      <div
        role="button"
        tabIndex="0"
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
      >
        <React3
          mainCamera="camera"
          width={width}
          height={height}
          pixelRatio={window.devicePixelRatio}
          alpha
        >
          <scene ref={(ref) => { this.scene = ref; }}>
            <perspectiveCamera
              name="camera"
              fov={FOV}
              aspect={width / height}
              near={near - 0.0001}
              far={far}
              position={new THREE.Vector3(x, y, z)}
              ref={this.setCameraRef}
            />
            <ContainerProvider container={{ width, height }}>
              {children}
            </ContainerProvider>
          </scene>
        </React3>
      </div>
    );
  }
}
