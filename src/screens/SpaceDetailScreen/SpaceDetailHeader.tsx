import AppStyles from 'common/AppStyles';
import SVG from 'common/SVG';
import RenderHTML from 'components/RenderHTML';
import SpaceIcon from 'components/SpaceIcon';
import Touchable from 'components/Touchable';
import {buildLinkOpenSea, buildLinkUniSwap} from 'helpers/LinkHelper';
import {normalizeMessageText} from 'helpers/MessageHelper';
import useThemeColor from 'hook/useThemeColor';
import {Space, SpaceCollectionData} from 'models';
import numeral from 'numeral';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {View, StyleSheet, Text, Linking} from 'react-native';
import FastImage from 'react-native-fast-image';

type ConditionItemProps = {
  item: SpaceCollectionData;
};

const ConditionItem = memo(({item}: ConditionItemProps) => {
  const {colors} = useThemeColor();
  const link = useMemo(() => {
    if (item.nft_collection) {
      if (item.nft_collection?.slug) {
        return buildLinkOpenSea(item.nft_collection.slug);
      }
      return item.nft_collection.external_url;
    }
    if (item.token_type === 'ERC20') {
      return buildLinkUniSwap({
        amount: item.amount,
        contract_address: item.contract_address,
      });
    }
    return '';
  }, [
    item.amount,
    item.contract_address,
    item.nft_collection,
    item.token_type,
  ]);
  const onGetCondition = useCallback(() => {
    Linking.openURL(link);
  }, [link]);
  return (
    <View
      style={[
        styles.conditionItem,
        {backgroundColor: colors.activeBackgroundLight},
      ]}>
      <Text
        style={[
          AppStyles.TextSemi16,
          {color: colors.text, marginHorizontal: 18},
        ]}>
        {item.amount < 10 ? `0${item.amount}` : item.amount}
      </Text>
      <View
        style={{
          height: 25,
          width: 1,
          backgroundColor: colors.activeBackground,
        }}
      />
      <FastImage
        source={{uri: item.nft_collection.image_url}}
        style={styles.logoContract}
      />
      <Text
        style={[
          AppStyles.TextMed15,
          {color: colors.text, flex: 1, marginLeft: 12},
        ]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {item.nft_collection.name}
      </Text>
      <Touchable style={styles.btnGet} useReactNative onPress={onGetCondition}>
        <Text style={[AppStyles.TextSemi16, {color: colors.mention}]}>Get</Text>
      </Touchable>
    </View>
  );
});

type SpaceDetailHeaderProps = {
  space: Space;
  totalMember: string;
  spaceConditions: SpaceCollectionData[];
};

const SpaceDetailHeader = ({
  space,
  totalMember,
  spaceConditions,
}: SpaceDetailHeaderProps) => {
  const contentRef = useRef<View>();
  const {colors} = useThemeColor();
  const [isMore, setIsMore] = useState<boolean | null>(null);
  const onContentLayout = useCallback(() => {
    contentRef.current.measure((ox, oy, w, h) => {
      if (isMore === null) {
        setIsMore(h > 80);
      }
    });
  }, [isMore]);
  const toggleViewMore = useCallback(() => setIsMore(current => !current), []);
  return (
    <View style={styles.container}>
      <View style={[styles.coverWrap, {backgroundColor: colors.border}]}>
        {!space.space_emoji && (
          <View
            style={[
              styles.spaceLogoWrap,
              {backgroundColor: colors.background},
            ]}>
            <SpaceIcon
              space={space}
              size={80}
              borderRadius={18}
              fontSize={35}
            />
          </View>
        )}
      </View>
      <View
        style={[
          styles.spaceNameWrap,
          {marginTop: space.space_emoji ? 15 : 50},
        ]}>
        {space.space_emoji && (
          <SpaceIcon space={space} size={32} style={{marginRight: 10}} />
        )}
        <Text style={[AppStyles.TextBold22, {color: colors.text}]}>
          {space.space_name}
        </Text>
      </View>
      <View style={styles.spaceBadgeWrap}>
        {space.space_type === 'Private' && (
          <View
            style={[
              styles.spaceBadge,
              {backgroundColor: colors.border, marginRight: 10},
            ]}>
            <SVG.IconStar fill={space.icon_color} width={25} height={25} />
            <Text
              style={[
                AppStyles.TextMed15,
                {marginLeft: 3, color: space.icon_color},
              ]}>
              Exclusive Space
            </Text>
          </View>
        )}
        <Text style={[AppStyles.TextSemi15, {color: colors.subtext}]}>
          {numeral(totalMember).format('0,0')}{' '}
          {parseInt(totalMember) > 1 ? 'members' : 'member'}
        </Text>
      </View>
      {!!space.space_description && (
        <>
          {!isMore ? (
            <View
              ref={contentRef}
              style={styles.contentDescription}
              onLayout={onContentLayout}>
              <RenderHTML
                html={normalizeMessageText(space.space_description)}
                defaultTextProps={{
                  style: [AppStyles.TextMed15, {color: colors.lightText}],
                }}
              />
            </View>
          ) : (
            <Text
              style={[
                AppStyles.TextMed15,
                {color: colors.lightText, marginTop: 20, marginHorizontal: 20},
              ]}
              numberOfLines={3}
              ellipsizeMode="tail">
              {space.space_description
                .replace(/<br>|<br\/>/gi, '\n')
                .replace(/(<([^>]+)>)/gi, '')}
            </Text>
          )}
          {isMore !== null && (
            <Touchable style={styles.btnViewMore} onPress={toggleViewMore}>
              <Text style={[AppStyles.TextSemi15, {color: colors.subtext}]}>
                {isMore ? 'View more' : 'View less'}
              </Text>
            </Touchable>
          )}
        </>
      )}
      {spaceConditions.length > 0 && (
        <View style={styles.spaceConditionWrap}>
          <Text style={[AppStyles.TextSemi15, {color: colors.lightText}]}>
            Entry requirement
          </Text>
          {spaceConditions.map(el => (
            <ConditionItem item={el} key={el.contract_address} />
          ))}
          <Text
            style={[
              AppStyles.TextMed15,
              {color: colors.subtext, marginTop: 10},
            ]}>
            You need to meet the above requirement to have access to the space.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  coverWrap: {
    margin: 10,
    height: 160,
    borderRadius: 5,
  },
  spaceLogoWrap: {
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 5,
    bottom: -45,
  },
  spaceNameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  spaceBadgeWrap: {
    marginHorizontal: 20,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBadge: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 10,
    borderRadius: 5,
  },
  contentDescription: {
    marginHorizontal: 20,
    marginTop: 15,
  },
  spaceConditionWrap: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  conditionItem: {
    marginTop: 10,
    height: 55,
    flexDirection: 'row',
    borderRadius: 5,
    alignItems: 'center',
  },
  logoContract: {
    width: 25,
    height: 25,
    marginLeft: 18,
  },
  btnGet: {
    padding: 10,
    marginHorizontal: 10,
  },
  btnViewMore: {
    marginTop: 5,
    marginHorizontal: 20,
  },
});

export default memo(SpaceDetailHeader);
