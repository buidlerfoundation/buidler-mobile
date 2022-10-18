import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import emoji from 'emoji-datasource';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import useThemeColor from 'hook/useThemeColor';
import AppStyles from 'common/AppStyles';
import Touchable from 'components/Touchable';
import {RecyclerListView, DataProvider} from 'recyclerlistview';
import StickyContainer from 'recyclerlistview/sticky';
import AppGridLayoutProvider from 'components/AppGridLayoutProvider';
import AppDimension from 'common/AppDimension';

export const Categories = {
  emotion: {
    symbol: '😀',
    name: 'Smileys & Emotion',
  },
  people: {
    symbol: '🧑',
    name: 'People & Body',
  },
  nature: {
    symbol: '🦄',
    name: 'Animals & Nature',
  },
  food: {
    symbol: '🍔',
    name: 'Food & Drink',
  },
  activities: {
    symbol: '⚾️',
    name: 'Activities',
  },
  places: {
    symbol: '✈️',
    name: 'Travel & Places',
  },
  objects: {
    symbol: '💡',
    name: 'Objects',
  },
  symbols: {
    symbol: '🔣',
    name: 'Symbols',
  },
  flags: {
    symbol: '🏳️‍🌈',
    name: 'Flags',
  },
};

const charFromUtf16 = utf16 =>
  String.fromCodePoint(...utf16.split('-').map(u => '0x' + u));
export const charFromEmojiObject = obj => charFromUtf16(obj.unified);
const filteredEmojis = emoji.filter(e => !e.obsoleted_by);
const emojiByCategory = category =>
  filteredEmojis.filter(e => e.category === category);
const sortEmoji = list => list.sort((a, b) => a.sort_order - b.sort_order);
const categoryKeys = Object.keys(Categories);

const TabBar = ({activeCategory, onPress, width}) => {
  const tabSize = width / categoryKeys.length;
  const {colors} = useThemeColor();
  return categoryKeys.map(c => {
    const category = Categories[c];
    if (c !== 'all')
      return (
        <Touchable
          key={category.name}
          onPress={() => onPress(category)}
          style={{
            flex: 1,
            height: tabSize,
            borderColor:
              category === activeCategory ? colors.text : 'transparent',
            borderBottomWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          useReactNative>
          <Text
            style={{
              textAlign: 'center',
              paddingBottom: 6,
              fontSize: 18,
            }}>
            {category.symbol}
          </Text>
        </Touchable>
      );
  });
};

const EmojiCell = memo(({emoji, colSize, onEmojiPress}) => {
  const onPress = useCallback(() => {
    onEmojiPress?.(emoji);
  }, [emoji, onEmojiPress]);
  return (
    <Touchable
      style={{
        width: colSize,
        height: colSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onPress}
      useReactNative>
      <Text style={{color: '#FFFFFF', fontSize: colSize - 12}}>
        {charFromEmojiObject(emoji)}
      </Text>
    </Touchable>
  );
});

type EmojiPickerProps = {
  columns?: number;
  onEmojiSelected: (item: any) => void;
};

const EmojiPicker = ({columns = 8, onEmojiSelected}: EmojiPickerProps) => {
  const listRef = useRef<RecyclerListView>();
  const {width} = useWindowDimensions();
  const {colors} = useThemeColor();
  const colSize = useMemo(() => Math.floor(width / columns), [columns, width]);
  const [emojiList, setEmojiList] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(Categories.emotion);
  const [query, setQuery] = useState('');
  const initEmojiList = useCallback(() => {
    const list = [{type: 'error', unified: 'error'}];
    categoryKeys.forEach(c => {
      const name = Categories[c].name;
      list.push({type: 'category', unified: name, key: c});
      list.push(
        ...sortEmoji(emojiByCategory(name)).map(el => ({...el, type: 'emoji'})),
      );
    });
    setEmojiList(list);
  }, []);
  const categoryList = useMemo(
    () =>
      emojiList.reduce((res, val, idx) => {
        if (val.type === 'category') {
          res.push({idx, ...val});
        }
        return res;
      }, []),
    [emojiList],
  );
  useEffect(() => {
    initEmojiList();
  }, [initEmojiList]);
  const handleTabSelect = useCallback(
    category => {
      setCurrentCategory(category);
      setQuery('');
      const index = categoryList.find(el => el.unified === category.name)?.idx;
      listRef.current.scrollToIndex(index);
    },
    [categoryList],
  );
  const onQueryChange = useCallback(text => setQuery(text), []);
  const addToHistoryAsync = useCallback(async emoji => {
    const previous = await AsyncStorage.getItem(AsyncKey.emojiKey);
    let value = [];
    const time = new Date().getTime();
    let existed = false;
    const record = Object.assign({}, emoji, {
      count: 1,
      timestamp: time,
    });
    if (!previous) {
      value.push(record);
    } else {
      let json = JSON.parse(previous);
      json = json.map(el => {
        if (el.unified === emoji.unified) {
          existed = true;
          return {
            ...el,
            count: el.count + 1,
            timestamp: time,
          };
        }
        return el;
      });
      if (existed) {
        value = json;
      } else {
        value = [record, ...json];
      }
      value.sort((v1, v2) => {
        if (v1.count < v2.count) return 1;
        if (v1.count > v2.count) return -1;
        if (v1.timestamp < v2.timestamp) return 1;
        return -1;
      });
    }
    AsyncStorage.setItem(AsyncKey.emojiKey, JSON.stringify(value));
  }, []);
  const onEmojiPress = useCallback(
    item => {
      onEmojiSelected(item);
      addToHistoryAsync(item);
    },
    [addToHistoryAsync, onEmojiSelected],
  );
  const renderRow = useCallback(
    (type, data) => {
      if (type === 'error') return <View />;
      if (type === 'emoji') {
        return (
          <EmojiCell
            emoji={data}
            onEmojiPress={onEmojiPress}
            colSize={colSize}
          />
        );
      }
      return (
        <View
          style={[styles.titleContainer, {backgroundColor: colors.background}]}>
          <Text
            style={[
              AppStyles.TextMed15,
              {
                color: colors.text,
              },
            ]}>
            {data.unified}
          </Text>
        </View>
      );
    },
    [colSize, colors.background, colors.text, onEmojiPress],
  );
  const emojiListFiltered = useMemo(() => {
    if (query) {
      return emojiList.filter(
        el => !!el.short_name?.includes?.(query.toLowerCase()),
      );
    }
    return emojiList;
  }, [emojiList, query]);
  const dataProvider = useMemo(
    () =>
      new DataProvider((r1, r2) => {
        return r1.unified !== r2.unified;
      }).cloneWithRows(emojiListFiltered),
    [emojiListFiltered],
  );
  const layoutProvider = useMemo(
    () => new AppGridLayoutProvider(dataProvider),
    [dataProvider],
  );
  const onVisibleIndicesChanged = useCallback(
    visibleList => {
      const firstVisibleIndex = visibleList?.[0];
      const list = [...categoryList];
      const reverseList = list.sort((v1, v2) => {
        if (v1.idx < v2.idx) return 1;
        return -1;
      });
      const visibleCategory = reverseList.find(
        el => el.idx <= firstVisibleIndex,
      );
      const cate = Categories?.[visibleCategory?.key || ''];
      if (cate) {
        setCurrentCategory(cate);
      }
    },
    [categoryList],
  );
  const renderFooter = useCallback(
    () => <View style={{height: 8 + AppDimension.extraBottom}} />,
    [],
  );
  return (
    <View style={styles.frame}>
      <View style={styles.tabBar}>
        <TabBar
          activeCategory={currentCategory}
          onPress={handleTabSelect}
          width={width}
        />
      </View>
      <View style={{flex: 1}}>
        <View
          style={[styles.searchBarWrap, {backgroundColor: colors.background}]}>
          <View
            style={[
              styles.searchBarContainer,
              {
                backgroundColor: colors.activeBackgroundLight,
                borderColor: colors.border,
              },
            ]}>
            <TextInput
              style={[styles.search, AppStyles.TextMed15, {color: colors.text}]}
              placeholder="Search"
              autoCorrect={false}
              value={query}
              onChangeText={onQueryChange}
              placeholderTextColor={colors.subtext}
              keyboardAppearance="dark"
              textAlignVertical="center"
              returnKeyType="done"
            />
          </View>
        </View>
        <View style={styles.container}>
          <StickyContainer stickyHeaderIndices={categoryList.map(el => el.idx)}>
            <RecyclerListView
              ref={ref => (listRef.current = ref)}
              rowRenderer={renderRow}
              dataProvider={dataProvider}
              layoutProvider={layoutProvider}
              onVisibleIndicesChanged={onVisibleIndicesChanged}
              renderFooter={renderFooter}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            />
          </StickyContainer>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
  },
  listEmoji: {
    flex: 1,
  },
  searchBarWrap: {
    padding: 8,
    zIndex: 2,
  },
  searchBarContainer: {
    borderRadius: 5,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  search: {
    paddingTop: 0,
  },
  container: {
    flex: 1,
  },
  sectionHeader: {
    margin: 8,
    fontSize: 17,
    width: '100%',
    color: '#8F8F8F',
  },
  titleContainer: {justifyContent: 'center', height: 30, paddingHorizontal: 8},
});

export default memo(EmojiPicker);
