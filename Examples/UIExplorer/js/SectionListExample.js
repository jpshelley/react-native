/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * The examples provided by Facebook are for non-commercial testing and
 * evaluation purposes only.
 *
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * @flow
 * @providesModule SectionListExample
 */
'use strict';

const React = require('react');
const ReactNative = require('react-native');
const {
  Alert,
  Animated,
  Button,
  SectionList,
  StyleSheet,
  Text,
  View,
} = ReactNative;

const UIExplorerPage = require('./UIExplorerPage');

const infoLog = require('infoLog');

const {
  HeaderComponent,
  FooterComponent,
  ItemComponent,
  PlainInput,
  SeparatorComponent,
  Spindicator,
  genItemData,
  pressItem,
  renderSmallSwitchOption,
  renderStackedItem,
} = require('./ListExampleShared');

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

const VIEWABILITY_CONFIG = {
  minimumViewTime: 3000,
  viewAreaCoveragePercentThreshold: 100,
  waitForInteraction: true,
};

const renderSectionHeader = ({section}) => (
  <View>
    <Text style={styles.headerText}>SECTION HEADER: {section.key}</Text>
    <SeparatorComponent />
  </View>
);

const CustomSeparatorComponent = ({text}) => (
  <View>
    <SeparatorComponent />
    <Text style={styles.separatorText}>{text}</Text>
    <SeparatorComponent />
  </View>
);

class SectionListExample extends React.PureComponent {
  static title = '<SectionList>';
  static description = 'Performant, scrollable list of data.';

  state = {
    data: genItemData(1000),
    debug: false,
    filterText: '',
    logViewable: false,
    virtualized: true,
  };

  _scrollPos = new Animated.Value(0);
  _scrollSinkY = Animated.event(
    [{nativeEvent: { contentOffset: { y: this._scrollPos } }}],
    {useNativeDriver: true},
  );

  render() {
    const filterRegex = new RegExp(String(this.state.filterText), 'i');
    const filter = (item) => (
      filterRegex.test(item.text) || filterRegex.test(item.title)
    );
    const filteredData = this.state.data.filter(filter);
    const filteredSectionData = [];
    let startIndex = 0;
    const endIndex = filteredData.length - 1;
    for (let ii = 10; ii <= endIndex + 10; ii += 10) {
      filteredSectionData.push({
        key: `${filteredData[startIndex].key} - ${filteredData[Math.min(ii - 1, endIndex)].key}`,
        data: filteredData.slice(startIndex, ii),
      });
      startIndex = ii;
    }
    return (
      <UIExplorerPage
        noSpacer={true}
        noScroll={true}>
        <View style={styles.searchRow}>
          <PlainInput
            onChangeText={filterText => {
              this.setState(() => ({filterText}));
            }}
            placeholder="Search..."
            value={this.state.filterText}
          />
          <View style={styles.optionSection}>
            {renderSmallSwitchOption(this, 'virtualized')}
            {renderSmallSwitchOption(this, 'logViewable')}
            {renderSmallSwitchOption(this, 'debug')}
            <Button
              onPress={() => {
                console.log(this._listRef.getNode());
                this._listRef.getNode().scrollToEnd();
              }}
              title="Press Me"
              accessibilityLabel="See an informative alert"
            />
            <Spindicator value={this._scrollPos} />
          </View>
        </View>
        <SeparatorComponent />
        <AnimatedSectionList
          ref={this._captureRef}
          ListHeaderComponent={HeaderComponent}
          ListFooterComponent={FooterComponent}
          SectionSeparatorComponent={() =>
            <CustomSeparatorComponent text="SECTION SEPARATOR" />
          }
          ItemSeparatorComponent={() =>
            <CustomSeparatorComponent text="ITEM SEPARATOR" />
          }
          debug={this.state.debug}
          enableVirtualization={this.state.virtualized}
          onRefresh={() => alert('onRefresh: nothing to refresh :P')}
          onScroll={this._scrollSinkY}
          onViewableItemsChanged={this._onViewableItemsChanged}
          refreshing={false}
          renderItem={this._renderItemComponent}
          renderSectionHeader={renderSectionHeader}
          sections={[
            {renderItem: renderStackedItem, key: 's1', data: [
              {title: 'Item In Header Section', text: 'Section s1', key: '0'},
            ]},
            {key: 's2', data: [
              {noImage: true, title: '1st item', text: 'Section s2', key: '0'},
              {noImage: true, title: '2nd item', text: 'Section s2', key: '1'},
            ]},
            ...filteredSectionData,
          ]}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
      </UIExplorerPage>
    );
  }
  _captureRef = (ref) => { this._listRef = ref; };
  _renderItemComponent = ({item}) => (
    <ItemComponent item={item} onPress={this._pressItem} />
  );
  // This is called when items change viewability by scrolling into our out of
  // the viewable area.
  _onViewableItemsChanged = (info: {
    changed: Array<{
      key: string,
      isViewable: boolean,
      item: {columns: Array<*>},
      index: ?number,
      section?: any
    }>},
  ) => {
    // Impressions can be logged here
    if (this.state.logViewable) {
      infoLog('onViewableItemsChanged: ', info.changed.map((v: Object) => (
        {...v, item: '...', section: v.section.key}
      )));
    }
  };
  _pressItem = (index: number) => {
    pressItem(this, index);
  };
  _listRef: SectionList<*>;
}

const styles = StyleSheet.create({
  headerText: {
    padding: 4,
  },
  optionSection: {
    flexDirection: 'row',
  },
  searchRow: {
    paddingHorizontal: 10,
  },
  separatorText: {
    color: 'gray',
    alignSelf: 'center',
    padding: 4,
    fontSize: 9,
  },
});

module.exports = SectionListExample;
