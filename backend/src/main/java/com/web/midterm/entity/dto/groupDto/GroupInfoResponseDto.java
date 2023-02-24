package com.web.midterm.entity.dto.groupDto;

import java.util.Date;
import java.util.List;

import com.web.midterm.entity.Presentation;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class GroupInfoResponseDto {
	private int ownerId;
	private Presentation present;
	private String role;
	private int groupId;
	private String groupLink;
	private String groupName;
	private Date createdAt;
	private List<UserGroupResponseDto> members;
}
