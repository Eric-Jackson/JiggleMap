import React from 'react';
import { shallow } from 'enzyme';

import { GBATilemap, Group } from 'components/Renderer';
import Map from '../Map';

describe('<Map />', () => {
  it('returns a GBATilemap layer for every tilemap', () => {
    const tilemap = new Uint8Array();
    const tilemaps = [tilemap, tilemap, tilemap];

    const wrapper = shallow(<Map tilemaps={tilemaps} />);

    expect(wrapper.find(GBATilemap)).toHaveLength(3);
  });

  it('passes props down to the tilemap', () => {
    const tileset = new Uint8Array();
    const palette = new Uint8Array();
    const tilemaps = [new Uint8Array(), new Uint8Array()];

    const wrapper = shallow(
      <Map
        tileset={tileset}
        palette={palette}
        tilemaps={tilemaps}
        width={10}
        height={5}
      />
    );

    expect(wrapper.find(GBATilemap).get(0).props).toMatchObject({
      palette,
      tileset,
      width: 10 * 16,
      height: 5 * 16,
    });
  });

  it('passes coordinates to the containing group', () => {
    const tilemaps = [new Uint8Array(), new Uint8Array()];

    const wrapper = shallow(
      <Map
        tilemaps={tilemaps}
        x={10}
        y={5}
      />
    );

    expect(wrapper.find(Group).props()).toMatchObject({
      x: 10 * 16,
      y: 5 * 16,
    });
  });

  it('passes a dark filter if set to darken', () => {
    const tilemaps = [new Uint8Array()];
    const wrapper = shallow(<Map tilemaps={tilemaps} darken />);
    expect(wrapper.find(GBATilemap).prop('colorFilter')).not.toEqual('');
  });
});
