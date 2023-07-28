// 프로필 이미지를 담당하는 컴포넌트

import React, {useMemo} from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  View,
  Image,
  ImageStyle,
  TextStyle,
  Text,
} from 'react-native';
import Colors from '../modules/Colors';

// 재사용을 위한 Props Optional
interface ProfileProps {
  // 프로필 이미지의 크기
  size?: number;
  // 외부에서 프로필 이미지의 스타일을 변경하게 용이하도록
  style?: StyleProp<ViewStyle>;
  // 프로필을 눌럿을때의 이벤트
  onPress?: () => void;
  imageUrl?: string;
  text?: string;
  textStyle?: StyleProp<TextStyle>;
}

const Profile = ({
  size = 48,
  style: containerStyleProp,
  onPress,
  imageUrl,
  text,
  textStyle,
}: ProfileProps) => {
  const containerStyle = useMemo<StyleProp<ViewStyle>>(() => {
    return [
      // 자체 스타일 container
      styles.container,
      // size 의 값이 변경 될 경우 아래 지정한 값으로 덮어쓰기 => 프로필 원 의 크기 영역
      {width: size, height: size, borderRadius: size / 2},
      containerStyleProp,
    ];
  }, [containerStyleProp, size]);

  const imageStyle = useMemo<StyleProp<ImageStyle>>(
    () => ({width: size, height: size}),
    [size],
  );
  return (
    // onPress 가 넘어오지 않을 경우 버튼이 활성화 되지 않게 disabled
    <TouchableOpacity disabled={onPress == null} onPress={onPress}>
      {/* 프로필 영역을 그려주는 View */}
      <View style={containerStyle}>
        {/* imageUrl 이 있는 경우 Image 컴포넌트를 그려줌 */}
        {/* {imageUrl && <Image source={{uri: imageUrl}} style={imageStyle} />} */}
        {/* imageUrl 이 없는 경우 Text 컴포넌트를 그리고, 아무것도 없는 경우 null */}
        {imageUrl ? (
          <Image source={{uri: imageUrl}} style={imageStyle} />
        ) : text ? (
          <Text style={textStyle}>{text}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.GRAY,
    overflow: 'hidden',
  },
});
