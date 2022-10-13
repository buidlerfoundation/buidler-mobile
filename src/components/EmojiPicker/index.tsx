import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import emoji from 'emoji-datasource';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AsyncKey} from 'common/AppStorage';
import useThemeColor from 'hook/useThemeColor';
import AppStyles from 'common/AppStyles';
import Touchable from 'components/Touchable';

export const Categories = {
  all: {
    symbol: null,
    name: 'All',
  },
  history: {
    symbol: '🕘',
    name: 'Recently used',
  },
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

const EmojiCell = ({emoji, colSize, onEmojiPress}) => {
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
};

type EmojiPickerProps = {
  columns?: number;
  onEmojiSelected: (item: any) => void;
};

const EmojiPicker = ({columns = 8, onEmojiSelected}: EmojiPickerProps) => {
  const listRef = useRef<FlatList>();
  const {width} = useWindowDimensions();
  const {colors} = useThemeColor();
  const colSize = useMemo(() => Math.floor(width / columns), [columns, width]);
  const [emojiList, setEmojiList] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(Categories.emotion);
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState('');
  const initEmojiList = useCallback(() => {
    const list = {};
    categoryKeys.forEach(c => {
      let name = Categories[c].name;
      list[name] = sortEmoji(emojiByCategory(name));
    });
    setEmojiList(list);
  }, []);
  useEffect(() => {
    initEmojiList();
    AsyncStorage.getItem(AsyncKey.emojiKey).then(res => {
      if (res) {
        setHistory(JSON.parse(res));
      }
    });
  }, [initEmojiList]);
  const handleTabSelect = useCallback(category => {
    setCurrentCategory(category);
    setQuery('');
    listRef.current?.scrollToOffset({x: 0, y: 0, animated: false});
  }, []);
  const onQueryChange = useCallback(text => setQuery(text), []);
  const dataEmoji = useCallback(() => {
    let list;
    const name = currentCategory.name;
    if (query) {
      const filtered = emoji.filter(e => {
        let display = false;
        e.short_names.forEach(name => {
          if (name.includes(query.toLowerCase())) display = true;
        });
        return display;
      });
      list = sortEmoji(filtered);
    } else if (name === Categories.history.name) {
      list = history;
    } else {
      list = emojiList?.[name];
    }
    return list;
  }, [currentCategory.name, emojiList, history, query]);
  const addToHistoryAsync = useCallback(async emoji => {
    const previous = await AsyncStorage.getItem(AsyncKey.emojiKey);

    let value = [];
    if (!previous) {
      let record = Object.assign({}, emoji, {count: 1});
      value.push(record);
    } else {
      let json = JSON.parse(previous);
      json = json.filter(el => el.unified !== emoji.unified);
      let record = Object.assign({}, emoji, {count: 1});
      value = [record, ...json];
    }

    AsyncStorage.setItem(AsyncKey.emojiKey, JSON.stringify(value));
    setHistory(value);
  }, []);
  const onEmojiPress = useCallback(
    item => {
      onEmojiSelected(item);
      addToHistoryAsync(item);
    },
    [addToHistoryAsync, onEmojiSelected],
  );
  const renderEmojiCell = useCallback(
    ({item}) => (
      <EmojiCell emoji={item} onEmojiPress={onEmojiPress} colSize={colSize} />
    ),
    [colSize, onEmojiPress],
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
        <View style={{flex: 1}}>
          <View style={styles.container}>
            <FlatList
              style={styles.listEmoji}
              contentContainerStyle={{paddingBottom: colSize}}
              data={dataEmoji()}
              renderItem={renderEmojiCell}
              numColumns={columns}
              keyboardDismissMode="on-drag"
              ref={listRef}
              keyExtractor={item => item.unified}
              initialNumToRender={60}
              windowSize={2}
            />
          </View>
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
  searchBarContainer: {
    margin: 8,
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
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionHeader: {
    margin: 8,
    fontSize: 17,
    width: '100%',
    color: '#8F8F8F',
  },
});

export default EmojiPicker;
