import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { PlayerProfile } from '../types/progression';

interface Props {
  profile: PlayerProfile;
}

const MOCK_CLUBS = [
  { name: 'Desert Pharaohs', tag: '#PHA001', members: 48, trophies: 142800, emoji: '🏺', color: '#f39c12', rank: 1 },
  { name: 'Sand Wraith Kings', tag: '#SWK77', members: 50, trophies: 138200, emoji: '🌪', color: '#3498db', rank: 2 },
  { name: 'Ancient Legends', tag: '#ANC42', members: 45, trophies: 129000, emoji: '👑', color: '#9b59b6', rank: 3 },
  { name: 'Stone Colossus', tag: '#STC19', members: 37, trophies: 98450,  emoji: '🗿', color: '#7f8c8d', rank: 4 },
  { name: 'Oracle Vision',   tag: '#ORC55', members: 42, trophies: 87600,  emoji: '🔮', color: '#5d6af5', rank: 5 },
];

const MOCK_MEMBERS = [
  { name: 'PyramidLord',   trophies: 3820, role: 'Leader',    emoji: '👑' },
  { name: 'SandStorm99',   trophies: 3410, role: 'Co-Leader', emoji: '⭐' },
  { name: 'OracleEye',     trophies: 3100, role: 'Elder',     emoji: '🔮' },
  { name: 'BerserkerAce',  trophies: 2780, role: 'Member',    emoji: '🪓' },
  { name: 'AnkhWarrior',   trophies: 2540, role: 'Member',    emoji: '☥' },
];

export default function ClubsScreen({ profile }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CLUBS</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>🏛 COMING SOON</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Your club banner */}
        <View style={styles.myClubBanner}>
          <Text style={styles.myClubEmoji}>🏺</Text>
          <View style={styles.myClubInfo}>
            <Text style={styles.myClubTitle}>You're not in a club yet</Text>
            <Text style={styles.myClubSub}>Join a club to battle together & earn extra rewards</Text>
          </View>
        </View>

        {/* Create / browse */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
            <Text style={styles.actionEmoji}>➕</Text>
            <Text style={styles.actionLabel}>Create Club</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGold]} activeOpacity={0.85}>
            <Text style={styles.actionEmoji}>🔍</Text>
            <Text style={styles.actionLabel}>Browse Clubs</Text>
          </TouchableOpacity>
        </View>

        {/* Top clubs */}
        <Text style={styles.sectionTitle}>🏆 TOP CLUBS</Text>
        <View style={styles.clubList}>
          {MOCK_CLUBS.map(club => (
            <TouchableOpacity key={club.tag} style={[styles.clubRow, { borderColor: club.color + '44' }]} activeOpacity={0.85}>
              {/* Rank */}
              <View style={styles.rankWrap}>
                <Text style={styles.rankNum}>#{club.rank}</Text>
              </View>
              {/* Icon */}
              <View style={[styles.clubIcon, { backgroundColor: club.color + '22' }]}>
                <Text style={styles.clubIconEmoji}>{club.emoji}</Text>
              </View>
              {/* Info */}
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.clubTag}>{club.tag} · {club.members} members</Text>
              </View>
              {/* Trophies */}
              <View style={styles.clubTrophies}>
                <Text style={styles.clubTrophyEmoji}>🏆</Text>
                <Text style={styles.clubTrophyVal}>{(club.trophies / 1000).toFixed(1)}K</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Club features preview */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>✨ CLUB FEATURES</Text>
        <View style={styles.featureList}>
          {[
            { emoji: '⚔️', title: 'Club Wars',       desc: '50v50 clan battles for massive rewards' },
            { emoji: '💬', title: 'Club Chat',        desc: 'Strategy discussions with your members' },
            { emoji: '🎁', title: 'Club Gifts',       desc: 'Donate cards and share shards daily' },
            { emoji: '📊', title: 'Leaderboard',      desc: 'Track your club\'s global ranking' },
          ].map(f => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>SOON</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Mock leaderboard */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>👥 DESERT PHARAOHS</Text>
        <Text style={styles.sectionSub}>Preview of club member list</Text>
        <View style={styles.memberList}>
          {MOCK_MEMBERS.map((m, i) => (
            <View key={m.name} style={styles.memberRow}>
              <Text style={styles.memberRank}>{i + 1}</Text>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarEmoji}>{m.emoji}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberRole}>{m.role}</Text>
              </View>
              <View style={styles.memberTrophies}>
                <Text style={styles.memberTrophyEmoji}>🏆</Text>
                <Text style={styles.memberTrophyVal}>{m.trophies.toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07071a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a1a2e',
    backgroundColor: '#0a0a18',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  headerBadge: {
    backgroundColor: '#9b59b622', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#9b59b644',
  },
  headerBadgeText: { color: '#9b59b6', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  scroll: { padding: 16 },
  sectionTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  sectionSub: { color: '#555', fontSize: 11, marginBottom: 10 },

  myClubBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#111428', borderRadius: 16,
    borderWidth: 1, borderColor: '#2a2a4a',
    padding: 16, marginBottom: 14,
  },
  myClubEmoji: { fontSize: 40 },
  myClubInfo: { flex: 1 },
  myClubTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  myClubSub: { color: '#666', fontSize: 11, marginTop: 3 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#111428', borderRadius: 14,
    borderWidth: 1, borderColor: '#2a2a4a',
    paddingVertical: 14,
  },
  actionBtnGold: { borderColor: '#f1c40f44', backgroundColor: '#1a1400' },
  actionEmoji: { fontSize: 18 },
  actionLabel: { color: '#fff', fontSize: 13, fontWeight: '800' },

  clubList: { gap: 8, marginBottom: 4 },
  clubRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#111428', borderRadius: 14,
    borderWidth: 1, padding: 12,
  },
  rankWrap: { width: 28, alignItems: 'center' },
  rankNum: { color: '#555', fontSize: 12, fontWeight: '900' },
  clubIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  clubIconEmoji: { fontSize: 24 },
  clubInfo: { flex: 1 },
  clubName: { color: '#fff', fontSize: 13, fontWeight: '800' },
  clubTag: { color: '#666', fontSize: 10, marginTop: 2 },
  clubTrophies: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  clubTrophyEmoji: { fontSize: 12 },
  clubTrophyVal: { color: '#f1c40f', fontSize: 13, fontWeight: '900' },

  featureList: { gap: 8 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#111428', borderRadius: 14,
    borderWidth: 1, borderColor: '#2a2a4a', padding: 14,
  },
  featureEmoji: { fontSize: 26 },
  featureInfo: { flex: 1 },
  featureTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  featureDesc: { color: '#666', fontSize: 11, marginTop: 2 },
  soonBadge: {
    backgroundColor: '#9b59b622', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#9b59b644',
  },
  soonText: { color: '#9b59b6', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  memberList: { gap: 6 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#111428', borderRadius: 12,
    borderWidth: 1, borderColor: '#1a1a2e', padding: 10,
  },
  memberRank: { color: '#555', fontSize: 12, fontWeight: '800', width: 20 },
  memberAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1a1a3a', alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarEmoji: { fontSize: 18 },
  memberInfo: { flex: 1 },
  memberName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  memberRole: { color: '#666', fontSize: 10 },
  memberTrophies: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  memberTrophyEmoji: { fontSize: 11 },
  memberTrophyVal: { color: '#f1c40f', fontSize: 12, fontWeight: '800' },
});
